from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from apps.perfiles.models import Perfil
from apps.usuarios.pagination import StandardLimitOffsetPagination
from .afinidad import anotar_afinidad
from .models import Local
from .serializers import ArtistaSugeridoSerializer, LocalPerfilSerializer, LocalWriteSerializer


class ParametroInvalido(Exception):
    def __init__(self, nombre):
        super().__init__(nombre)
        self.nombre = nombre


def leer_entero(params, nombre):
    valor = params.get(nombre)
    if valor in (None, ''):
        return None
    try:
        return int(valor)
    except ValueError:
        raise ParametroInvalido(nombre)


def leer_enteros(params, nombre):
    try:
        return [int(v) for v in params.getlist(nombre) if v != '']
    except ValueError:
        raise ParametroInvalido(nombre)


def perfil_de_referencia(request):
    """Perfil personal del usuario logueado, para ordenar por afinidad (o None)."""
    if not request.user or not request.user.is_authenticated:
        return None
    return Perfil.objects.filter(
        usuario_id=request.user.usuario_id, tipo=Perfil.TipoPerfil.USUARIO,
    ).first()


def respuesta_parametro_invalido(nombre):
    return Response(
        {'error': f'Parámetro {nombre} no válido'},
        status=status.HTTP_400_BAD_REQUEST,
    )


class LocalListView(APIView):
    """
    GET /api/locales  → búsqueda pública de locales.
    Filtros: ciudad, comarca, aforo_min, aforo_max, tipo (repetible, OR),
    genero (repetible), search. Con login se ordena por afinidad con mi perfil.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        params = request.query_params
        try:
            ciudad = leer_entero(params, 'ciudad')
            comarca = leer_entero(params, 'comarca')
            aforo_min = leer_entero(params, 'aforo_min')
            aforo_max = leer_entero(params, 'aforo_max')
            generos = leer_enteros(params, 'genero')
        except ParametroInvalido as e:
            return respuesta_parametro_invalido(e.nombre)

        tipos = [t for t in params.getlist('tipo') if t != '']
        if any(t not in Local.TipoLocal.values for t in tipos):
            return respuesta_parametro_invalido('tipo')

        qs = Perfil.objects.filter(tipo=Perfil.TipoPerfil.LOCAL, local__isnull=False)
        if ciudad is not None:
            qs = qs.filter(local__ciudad_id=ciudad)
        if comarca is not None:
            qs = qs.filter(local__ciudad__comarca_id=comarca)
        if aforo_min is not None:
            qs = qs.filter(local__aforo__gte=aforo_min)
        if aforo_max is not None:
            qs = qs.filter(local__aforo__lte=aforo_max)
        if tipos:
            qs = qs.filter(local__tipos__overlap=tipos)
        if generos:
            qs = qs.filter(
                pk__in=Perfil.objects.filter(perfil_generos__genero_id__in=generos).values('pk'),
            )
        search = params.get('search', '').strip()
        if search:
            qs = qs.filter(Q(nombre__icontains=search) | Q(descripcion__icontains=search))

        qs = anotar_afinidad(qs, perfil_de_referencia(request))
        qs = qs.select_related('local__ciudad').prefetch_related('perfil_generos')

        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(LocalPerfilSerializer(page, many=True).data)


class LocalDetailView(APIView):
    """
    - GET /api/locales/:perfil_id  → perfil local + datos del local (público)
    - PUT /api/locales/:perfil_id  → crea o actualiza los datos del local (auth, solo dueño)
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk=None):
        perfil = Perfil.objects.filter(pk=pk, tipo=Perfil.TipoPerfil.LOCAL).first()
        if not perfil:
            return Response({'error': 'Local no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(LocalPerfilSerializer(perfil).data)

    def put(self, request, pk=None):
        perfil = Perfil.objects.filter(pk=pk).first()
        if not perfil:
            return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario_id != request.user.usuario_id:
            return Response(
                {'error': 'No puedes editar el local de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if perfil.tipo != Perfil.TipoPerfil.LOCAL:
            return Response(
                {'error': 'Solo un perfil de tipo local puede tener datos de local'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existente = Local.objects.filter(perfil=perfil).first()
        serializer = LocalWriteSerializer(existente, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(perfil=perfil)

        perfil.refresh_from_db()
        return Response(LocalPerfilSerializer(perfil).data, status=status.HTTP_200_OK)


class ArtistasSugeridosView(APIView):
    """
    GET /api/locales/:perfil_id/artistas-sugeridos  → músicos y grupos disponibles,
    ordenados por afinidad con el local (misma comarca, géneros en común). Público.
    Filtros opcionales: comarca, genero (repetible).
    """
    permission_classes = [AllowAny]

    def get(self, request, pk=None):
        local = Perfil.objects.filter(pk=pk, tipo=Perfil.TipoPerfil.LOCAL).first()
        if not local:
            return Response({'error': 'Local no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        try:
            comarca = leer_entero(request.query_params, 'comarca')
            generos = leer_enteros(request.query_params, 'genero')
        except ParametroInvalido as e:
            return respuesta_parametro_invalido(e.nombre)

        qs = Perfil.objects.filter(
            tipo__in=[Perfil.TipoPerfil.USUARIO, Perfil.TipoPerfil.GRUPO],
            disponibilidad=True,
        )
        if comarca is not None:
            qs = qs.filter(comarca_id=comarca)
        if generos:
            qs = qs.filter(
                pk__in=Perfil.objects.filter(perfil_generos__genero_id__in=generos).values('pk'),
            )

        qs = anotar_afinidad(qs, local)

        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(ArtistaSugeridoSerializer(page, many=True).data)
