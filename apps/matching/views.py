from collections import defaultdict

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.locales.afinidad import anotar_afinidad
from apps.locales.models import Local
from apps.locales.serializers import LocalDatosSerializer
from apps.perfiles.models import Perfil, PerfilGeneroMusical, PerfilInstrumento
from apps.usuarios.pagination import StandardLimitOffsetPagination

TIPOS_PARA_TOCAR = [Local.TipoLocal.SALA, Local.TipoLocal.BAR, Local.TipoLocal.TEATRO, Local.TipoLocal.OTRO]


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


class MatchView(APIView):
    """
    GET /api/match?busco=musico|grupo|ensayo|tocar[&instrumento=<id>]  (auth)
    Sugerencias para mi perfil personal, ordenadas por cercanía y estilos en común,
    con los motivos de cada una. Nunca sugiere mis propios perfiles.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        busco = request.query_params.get('busco', '')
        if busco not in ('musico', 'grupo', 'ensayo', 'tocar'):
            return Response({'error': 'Parámetro busco no válido'}, status=status.HTTP_400_BAD_REQUEST)

        instrumento = request.query_params.get('instrumento', '')
        if instrumento:
            try:
                instrumento = int(instrumento)
            except ValueError:
                return Response({'error': 'Parámetro instrumento no válido'}, status=status.HTTP_400_BAD_REQUEST)

        yo = Perfil.objects.filter(
            usuario_id=request.user.usuario_id, tipo=Perfil.TipoPerfil.USUARIO,
        ).first()
        if not yo:
            return Response(
                {'error': 'Crea tu perfil para ver tus matches'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs, campo_comarca = candidatos(busco)
        qs = qs.exclude(usuario_id=request.user.usuario_id)
        if instrumento and busco == 'musico':
            qs = qs.filter(
                pk__in=PerfilInstrumento.objects.filter(instrumento_id=instrumento).values('perfil_id'),
            )
        qs = anotar_afinidad(qs, yo, campo_comarca).select_related('comarca', 'local__ciudad')

        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        return paginator.get_paginated_response(self.serializar(page, yo))

    def serializar(self, perfiles, yo):
        ids = [p.perfil_id for p in perfiles]
        generos = nombres_por_perfil(PerfilGeneroMusical, 'genero', ids)
        instrumentos = nombres_por_perfil(PerfilInstrumento, 'instrumento', ids)
        mis_generos = set(nombres_por_perfil(PerfilGeneroMusical, 'genero', [yo.perfil_id]).get(yo.perfil_id, []))

        datos = []
        for p in perfiles:
            try:
                local = p.local
            except Local.DoesNotExist:
                local = None
            if local:
                zona = local.ciudad.nombre
            else:
                zona = p.comarca.nombre if p.comarca else None
            datos.append({
                'perfil_id': p.perfil_id,
                'nombre': p.nombre,
                'apellido': p.apellido,
                'tipo': p.tipo,
                'descripcion': p.descripcion,
                'zona': zona,
                'misma_comarca': p.misma_comarca,
                'generos_comunes': [g for g in generos.get(p.perfil_id, []) if g in mis_generos],
                'instrumentos': instrumentos.get(p.perfil_id, []),
                'local': LocalDatosSerializer(local).data if local else None,
            })
        return datos
