from collections import defaultdict

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.anuncios.models import Anuncio
from apps.catalogo.models import GeneroMusical, Instrumento
from apps.locales.afinidad import anotar_afinidad, comarca_de
from apps.locales.models import Local
from apps.locales.serializers import LocalDatosSerializer
from apps.perfiles.models import Perfil, PerfilGeneroMusical, PerfilInstrumento
from apps.usuarios.pagination import StandardLimitOffsetPagination
from .inferencia import busqueda_de, catalogo_normalizado
from .models import BusquedaAnuncio
from .serializers import BusquedaAnuncioWriteSerializer

TIPOS_PARA_TOCAR = [Local.TipoLocal.SALA, Local.TipoLocal.BAR, Local.TipoLocal.TEATRO, Local.TipoLocal.OTRO]

# Cuántos anuncios recientes se puntúan para "anuncios para mí"
ANUNCIOS_A_EVALUAR = 300


def candidatos(busco):
    """Queryset de perfiles candidatos y el campo con su comarca, según lo que se busca."""
    if busco == 'musico':
        return Perfil.objects.filter(tipo=Perfil.TipoPerfil.USUARIO, disponibilidad=True), 'comarca_id'
    if busco == 'grupo':
        return Perfil.objects.filter(tipo=Perfil.TipoPerfil.GRUPO, disponibilidad=True), 'comarca_id'
    locales = Perfil.objects.filter(tipo=Perfil.TipoPerfil.LOCAL, local__isnull=False)
    if busco == 'ensayo':
        locales = locales.filter(local__tipos__contains=[Local.TipoLocal.ENSAYO])
    else:
        locales = locales.filter(local__tipos__overlap=TIPOS_PARA_TOCAR)
    return locales, 'local__ciudad__comarca_id'


def nombres_por_perfil(modelo, campo, perfil_ids):
    """{perfil_id: [nombres]} leyendo solo columnas de la pivote (en la BD real no tiene id)."""
    resultado = defaultdict(list)
    filas = modelo.objects.filter(perfil_id__in=perfil_ids).values_list('perfil_id', f'{campo}__nombre')
    for perfil_id, nombre in filas:
        resultado[perfil_id].append(nombre)
    return {k: sorted(v) for k, v in resultado.items()}


def ids_por_perfil(modelo, campo, perfil_id):
    return set(modelo.objects.filter(perfil_id=perfil_id).values_list(f'{campo}_id', flat=True))


def zona_de(perfil):
    try:
        return perfil.local.ciudad.nombre
    except Local.DoesNotExist:
        return perfil.comarca.nombre if perfil.comarca else None


def serializar_perfiles(perfiles, generos_ref_nombres):
    """Perfiles sugeridos con sus motivos (zona, estilos en común con la referencia, instrumentos)."""
    ids = [p.perfil_id for p in perfiles]
    generos = nombres_por_perfil(PerfilGeneroMusical, 'genero', ids)
    instrumentos = nombres_por_perfil(PerfilInstrumento, 'instrumento', ids)
    datos = []
    for p in perfiles:
        try:
            local = p.local
        except Local.DoesNotExist:
            local = None
        datos.append({
            'perfil_id': p.perfil_id,
            'nombre': p.nombre,
            'apellido': p.apellido,
            'tipo': p.tipo,
            'descripcion': p.descripcion,
            'zona': zona_de(p),
            'misma_comarca': p.misma_comarca,
            'generos_comunes': [g for g in generos.get(p.perfil_id, []) if g in generos_ref_nombres],
            'instrumentos': instrumentos.get(p.perfil_id, []),
            'local': LocalDatosSerializer(local).data if local else None,
        })
    return datos


def mi_perfil_personal(request):
    return Perfil.objects.filter(
        usuario_id=request.user.usuario_id, tipo=Perfil.TipoPerfil.USUARIO,
    ).first()


def error(mensaje, codigo):
    return Response({'error': mensaje}, status=codigo)


class MatchView(APIView):
    """
    GET /api/match?busco=musico|grupo|ensayo|tocar|anuncios[&instrumento=<id>]  (auth)
    Sugerencias para mi perfil personal, ordenadas por cercanía y estilos en común,
    con los motivos de cada una. Nunca sugiere mis propios perfiles ni anuncios.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        busco = request.query_params.get('busco', '')
        if busco not in ('musico', 'grupo', 'ensayo', 'tocar', 'anuncios'):
            return error('Parámetro busco no válido', status.HTTP_400_BAD_REQUEST)

        instrumento = request.query_params.get('instrumento', '')
        if instrumento:
            try:
                instrumento = int(instrumento)
            except ValueError:
                return error('Parámetro instrumento no válido', status.HTTP_400_BAD_REQUEST)

        yo = mi_perfil_personal(request)
        if not yo:
            return error('Crea tu perfil para ver tus matches', status.HTTP_400_BAD_REQUEST)

        if busco == 'anuncios':
            return self.anuncios_para_mi(request, yo)

        qs, campo_comarca = candidatos(busco)
        qs = qs.exclude(usuario_id=request.user.usuario_id)
        if instrumento and busco == 'musico':
            qs = qs.filter(
                pk__in=PerfilInstrumento.objects.filter(instrumento_id=instrumento).values('perfil_id'),
            )
        qs = anotar_afinidad(qs, yo, campo_comarca).select_related('comarca', 'local__ciudad')

        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        mis_generos = set(nombres_por_perfil(PerfilGeneroMusical, 'genero', [yo.perfil_id]).get(yo.perfil_id, []))
        return paginator.get_paginated_response(serializar_perfiles(page, mis_generos))

    def anuncios_para_mi(self, request, yo):
        """
        Anuncios que buscan lo que soy: mi instrumento o mis estilos (y, si lo indican,
        un músico). Primero los que buscan mi instrumento, luego los de mi comarca,
        luego los que comparten más estilos; a igualdad, los más recientes.
        """
        catalogo = catalogo_normalizado()
        nombres_genero = dict(GeneroMusical.objects.values_list('genero_musical_id', 'nombre'))
        nombres_instr = dict(Instrumento.objects.values_list('instrumento_id', 'nombre'))
        mis_instrumentos = ids_por_perfil(PerfilInstrumento, 'instrumento', yo.perfil_id)
        mis_generos = ids_por_perfil(PerfilGeneroMusical, 'genero', yo.perfil_id)
        mi_comarca = comarca_de(yo)

        anuncios = (
            Anuncio.objects.exclude(perfil__usuario_id=request.user.usuario_id)
            .select_related('perfil__comarca', 'perfil__local__ciudad', 'busqueda')
            .order_by('-fecha_publicacion')[:ANUNCIOS_A_EVALUAR]
        )

        puntuados = []
        for a in anuncios:
            b = busqueda_de(a, catalogo)
            if b['tipo_perfil'] not in (None, Perfil.TipoPerfil.USUARIO):
                continue
            if b['instrumento_id'] and b['instrumento_id'] not in mis_instrumentos:
                continue
            busca_mi_instrumento = bool(b['instrumento_id'])
            comunes = [g for g in b['generos'] if g in mis_generos]
            if not busca_mi_instrumento and not comunes:
                continue
            autor = a.perfil
            misma_comarca = bool(mi_comarca and autor and comarca_de(autor) == mi_comarca)
            puntuados.append(((busca_mi_instrumento, misma_comarca, len(comunes), a.fecha_publicacion), a, b, comunes))

        puntuados.sort(key=lambda x: x[0], reverse=True)

        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(puntuados, request, view=self)
        datos = []
        for (busca_mi_instrumento, misma_comarca, _, _), a, b, comunes in page:
            autor = a.perfil
            datos.append({
                'anuncio_id': a.anuncio_id,
                'titulo': a.titulo,
                'contenido': a.contenido,
                'fecha_publicacion': a.fecha_publicacion,
                'autor': {
                    'perfil_id': autor.perfil_id,
                    'nombre': autor.nombre,
                    'apellido': autor.apellido,
                    'tipo': autor.tipo,
                } if autor else None,
                'zona': zona_de(autor) if autor else None,
                'misma_comarca': misma_comarca,
                'busca_mi_instrumento': busca_mi_instrumento,
                'instrumento': nombres_instr.get(b['instrumento_id']),
                'generos_comunes': sorted(nombres_genero[g] for g in comunes),
                'inferida': b['inferida'],
            })
        return paginator.get_paginated_response(datos)


def busqueda_respuesta(anuncio, b):
    generos = GeneroMusical.objects.filter(pk__in=b['generos']).order_by('nombre')
    instrumento = Instrumento.objects.filter(pk=b['instrumento_id']).first() if b['instrumento_id'] else None
    return {
        'anuncio_id': anuncio.anuncio_id,
        'tipo_perfil': b['tipo_perfil'],
        'instrumento_id': b['instrumento_id'],
        'instrumento': instrumento.nombre if instrumento else None,
        'generos': [{'genero_musical_id': g.genero_musical_id, 'nombre': g.nombre} for g in generos],
        'inferida': b['inferida'],
    }


class BusquedaAnuncioView(APIView):
    """
    - GET /api/match/anuncios/:anuncio_id/busqueda  → qué busca el anuncio (público).
      Si no tiene "¿Qué buscas?", se deduce del texto (inferida: true).
    - PUT /api/match/anuncios/:anuncio_id/busqueda  → guardarlo (solo el dueño del anuncio).
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk=None):
        anuncio = Anuncio.objects.filter(pk=pk).first()
        if not anuncio:
            return error('Anuncio no encontrado', status.HTTP_404_NOT_FOUND)
        return Response(busqueda_respuesta(anuncio, busqueda_de(anuncio, catalogo_normalizado())))

    def put(self, request, pk=None):
        anuncio = Anuncio.objects.select_related('perfil').filter(pk=pk).first()
        if not anuncio:
            return error('Anuncio no encontrado', status.HTTP_404_NOT_FOUND)
        if not anuncio.perfil or anuncio.perfil.usuario_id != request.user.usuario_id:
            return error('No puedes editar el anuncio de otro usuario', status.HTTP_403_FORBIDDEN)

        serializer = BusquedaAnuncioWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        datos = serializer.validated_data
        BusquedaAnuncio.objects.update_or_create(
            anuncio=anuncio,
            defaults={
                'tipo_perfil': datos['tipo_perfil'],
                'instrumento': datos['instrumento'],
                'generos': datos['generos'],
            },
        )
        anuncio.refresh_from_db()
        return Response(busqueda_respuesta(anuncio, busqueda_de(anuncio, None)))


class CandidatosAnuncioView(APIView):
    """
    GET /api/match/anuncios/:anuncio_id/candidatos  → perfiles que encajan con lo que busca
    mi anuncio (solo el dueño). Filtra por tipo e instrumento buscados y ordena por
    cercanía al autor y estilos en común con los que busca el anuncio.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        anuncio = Anuncio.objects.select_related('perfil').filter(pk=pk).first()
        if not anuncio:
            return error('Anuncio no encontrado', status.HTTP_404_NOT_FOUND)
        autor = anuncio.perfil
        if not autor or autor.usuario_id != request.user.usuario_id:
            return error('Solo el autor del anuncio puede ver sus candidatos', status.HTTP_403_FORBIDDEN)

        b = busqueda_de(anuncio, catalogo_normalizado())
        if b['tipo_perfil'] == Perfil.TipoPerfil.LOCAL:
            qs = Perfil.objects.filter(tipo=Perfil.TipoPerfil.LOCAL, local__isnull=False)
            campo_comarca = 'local__ciudad__comarca_id'
        elif b['tipo_perfil']:
            qs = Perfil.objects.filter(tipo=b['tipo_perfil'], disponibilidad=True)
            campo_comarca = 'comarca_id'
        else:
            qs = Perfil.objects.filter(
                tipo__in=[Perfil.TipoPerfil.USUARIO, Perfil.TipoPerfil.GRUPO], disponibilidad=True,
            )
            campo_comarca = 'comarca_id'
        qs = qs.exclude(usuario_id=request.user.usuario_id)
        if b['instrumento_id']:
            qs = qs.filter(
                pk__in=PerfilInstrumento.objects.filter(instrumento_id=b['instrumento_id']).values('perfil_id'),
            )

        generos_ref = b['generos'] or None
        qs = anotar_afinidad(qs, autor, campo_comarca, generos_ref).select_related('comarca', 'local__ciudad')

        if generos_ref:
            nombres_ref = set(GeneroMusical.objects.filter(pk__in=generos_ref).values_list('nombre', flat=True))
        else:
            nombres_ref = set(nombres_por_perfil(PerfilGeneroMusical, 'genero', [autor.perfil_id]).get(autor.perfil_id, []))

        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(serializar_perfiles(page, nombres_ref))
