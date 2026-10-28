from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalogo.models import GeneroMusical
from apps.perfiles.models import Perfil
from apps.usuarios.pagination import StandardLimitOffsetPagination
from .models import Evento
from .serializers import EventoSerializer, EventoWriteSerializer


class ParametroInvalido(Exception):
    pass


def leer_entero(params, nombre):
    valor = params.get(nombre, '')
    if valor == '':
        return None
    try:
        return int(valor)
    except ValueError:
        raise ParametroInvalido(nombre)


def leer_fecha(params, nombre):
    valor = params.get(nombre, '')
    if valor == '':
        return None
    fecha = parse_datetime(valor)
    if fecha is None:
        raise ParametroInvalido(nombre)
    return fecha if timezone.is_aware(fecha) else timezone.make_aware(fecha)


def error(mensaje, codigo):
    return Response({'error': mensaje}, status=codigo)


def serializar(eventos, many=False):
    """Serializa resolviendo los nombres de los géneros con una sola consulta."""
    lista = eventos if many else [eventos]
    ids = {g for e in lista for g in e.generos}
    nombres = dict(GeneroMusical.objects.filter(pk__in=ids).values_list('genero_musical_id', 'nombre'))
    return EventoSerializer(eventos, many=many, context={'nombres_genero': nombres}).data


def base_queryset():
    return Evento.objects.select_related('perfil', 'local', 'ciudad')


class EventoListView(APIView):
    """
    - GET  /api/eventos  → eventos desde ahora (o ?desde=) por fecha (público).
      Filtros: desde, hasta (ISO 8601), ciudad, comarca, genero (repetible),
      perfil (eventos que publica o que acoge ese perfil).
    - POST /api/eventos  → publicar (auth). perfil_id opcional: uno de mis perfiles;
      por defecto mi perfil personal.
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        params = request.query_params
        try:
            desde = leer_fecha(params, 'desde') or timezone.now()
            hasta = leer_fecha(params, 'hasta')
            ciudad = leer_entero(params, 'ciudad')
            comarca = leer_entero(params, 'comarca')
            perfil = leer_entero(params, 'perfil')
            try:
                generos = [int(g) for g in params.getlist('genero') if g != '']
            except ValueError:
                raise ParametroInvalido('genero')
        except ParametroInvalido as e:
            return error(f'Parámetro {e} no válido', status.HTTP_400_BAD_REQUEST)

        qs = base_queryset().filter(fecha_inicio__gte=desde)
        if hasta is not None:
            qs = qs.filter(fecha_inicio__lte=hasta)
        if ciudad is not None:
            qs = qs.filter(ciudad_id=ciudad)
        if comarca is not None:
            qs = qs.filter(ciudad__comarca_id=comarca)
        if generos:
            qs = qs.filter(generos__overlap=generos)
        if perfil is not None:
            qs = qs.filter(Q(perfil_id=perfil) | Q(local_id=perfil))

        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(serializar(page, many=True))

    def post(self, request):
        mis_perfiles = Perfil.objects.filter(usuario_id=request.user.usuario_id)
        perfil_id = request.data.get('perfil_id')
        if perfil_id not in (None, ''):
            autor = Perfil.objects.filter(pk=perfil_id).first()
            if not autor or autor.usuario_id != request.user.usuario_id:
                return error('Solo puedes publicar con uno de tus perfiles', status.HTTP_403_FORBIDDEN)
        else:
            autor = (
                mis_perfiles.filter(tipo=Perfil.TipoPerfil.USUARIO).first() or mis_perfiles.first()
            )
            if not autor:
                return error('Crea tu perfil antes de publicar un evento', status.HTTP_400_BAD_REQUEST)

        serializer = EventoWriteSerializer(data=request.data, context={'usuario_id': request.user.usuario_id})
        serializer.is_valid(raise_exception=True)
        evento = serializer.save(perfil=autor)
        return Response(serializar(base_queryset().get(pk=evento.pk)), status=status.HTTP_201_CREATED)


class EventoDetailView(APIView):
    """
    - GET    /api/eventos/:id  → detalle (público)
    - PUT    /api/eventos/:id  → editar (solo el autor; cambios parciales)
    - DELETE /api/eventos/:id  → borrar (solo el autor)
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def obtener(self, pk):
        return base_queryset().filter(pk=pk).first()

    def es_autor(self, request, evento):
        return evento.perfil.usuario_id == request.user.usuario_id

    def get(self, request, pk=None):
        evento = self.obtener(pk)
        if not evento:
            return error('Evento no encontrado', status.HTTP_404_NOT_FOUND)
        return Response(serializar(evento))

    def put(self, request, pk=None):
        evento = self.obtener(pk)
        if not evento:
            return error('Evento no encontrado', status.HTTP_404_NOT_FOUND)
        if not self.es_autor(request, evento):
            return error('No puedes editar el evento de otro usuario', status.HTTP_403_FORBIDDEN)
        serializer = EventoWriteSerializer(
            evento, data=request.data, partial=True, context={'usuario_id': request.user.usuario_id},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializar(self.obtener(pk)))

    def delete(self, request, pk=None):
        evento = self.obtener(pk)
        if not evento:
            return error('Evento no encontrado', status.HTTP_404_NOT_FOUND)
        if not self.es_autor(request, evento):
            return error('No puedes borrar el evento de otro usuario', status.HTTP_403_FORBIDDEN)
        evento.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MisPerfilesView(APIView):
    """GET /api/eventos/mis-perfiles  → perfiles con los que puedo publicar (auth)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        perfiles = Perfil.objects.filter(usuario_id=request.user.usuario_id).order_by('perfil_id')
        return Response([
            {'perfil_id': p.perfil_id, 'nombre': p.nombre, 'apellido': p.apellido, 'tipo': p.tipo}
            for p in perfiles
        ])
