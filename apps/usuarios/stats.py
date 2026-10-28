from datetime import timedelta

from django.core.cache import cache
from django.utils import timezone

from apps.anuncios.models import Anuncio, Comentario
from apps.chats.models import Mensaje
from apps.perfiles.models import Perfil, PerfilGrupo

from .presence import count_online

CACHE_KEY = 'landing:stats:v1'
CACHE_TTL = 300  # 5 minutos


def invalidate_stats_cache():
    """Borra la caché de stats. La llaman las signals al cambiar datos."""
    cache.delete(CACHE_KEY)


def _rol_del_perfil(perfil):
    """
    Devuelve un string tipo "Guitarra · Madrid" o "Músico · Madrid" o "Músico".
    - Instrumento principal: el primero (si hay).
    - Comarca: si hay.
    - Si no hay instrumento: "Músico".
    Nunca expone correo, perfil_id ni apellido completo.
    """
    instrumento = (
        perfil.perfil_instrumentos
        .select_related('instrumento')
        .first()
    )
    prefijo = instrumento.instrumento.nombre if instrumento else 'Músico'

    comarca = getattr(perfil.comarca, 'nombre', None) if perfil.comarca_id else None
    return f'{prefijo} · {comarca}' if comarca else prefijo


def _testimonios(limit=3, min_chars=40):
    """
    Devuelve hasta `limit` testimonios reales de perfiles, anonimizados.
    - Solo perfiles con `testimonio` no vacío y >= `min_chars`.
    - Nombre + inicial del apellido.
    - Rol (instrumento · comarca).
    """
    qs = (
        Perfil.objects
        .exclude(testimonio__isnull=True)
        .exclude(testimonio='')
        .select_related('comarca')
        .prefetch_related('perfil_instrumentos__instrumento')
        .order_by('-fecha_creacion')
    )

    resultados = []
    for perfil in qs.iterator(chunk_size=50):
        contenido = (perfil.testimonio or '').strip()
        if len(contenido) < min_chars:
            continue
        nombre = (perfil.nombre or '').strip()
        apellido = (perfil.apellido or '').strip()
        if not nombre:
            continue
        inicial = apellido[0].upper() + '.' if apellido else ''
        nombre_mostrado = f'{nombre} {inicial}'.strip()

        resultados.append({
            'nombre': nombre_mostrado,
            'rol': _rol_del_perfil(perfil),
            'quote': contenido,
        })
        if len(resultados) >= limit:
            break

    return resultados

def get_stats():
    cached = cache.get(CACHE_KEY)
    if cached is None:
        now = timezone.now()
        hace_30_dias = now - timedelta(days=30)

        cached = {
            'usuarios_activos': Perfil.objects.filter(tipo='usuario').count(),
            'grupos_formados': (
                PerfilGrupo.objects
                .values('grupo')
                .distinct()
                .count()
            ),
            'anuncios_mes': Anuncio.objects.filter(
                fecha_publicacion__gte=hace_30_dias
            ).count(),
            'matches': (
                Mensaje.objects
                .values('chat')
                .distinct()
                .count()
            ),
            'testimonios': _testimonios(limit=3),
        }
        cache.set(CACHE_KEY, cached, timeout=CACHE_TTL)

    # `usuarios_online` se calcula SIEMPRE en fresco (cambia cada minuto).
    return {**cached, 'usuarios_online': count_online()}