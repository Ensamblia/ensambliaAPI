import pytest
from rest_framework import status
from django.core.cache import cache

from apps.anuncios.models import Anuncio, Comentario
from apps.chats.models import Chat, Mensaje
from apps.catalogo.models import Grupo, Instrumento
from apps.perfiles.models import Perfil, PerfilGrupo, PerfilInstrumento
from apps.usuarios.stats import get_stats, invalidate_stats_cache, CACHE_KEY


@pytest.fixture(autouse=True)
def _limpiar_cache():
    """Limpia la caché de stats entre tests."""
    invalidate_stats_cache()
    yield
    invalidate_stats_cache()


# ==============================================================
# ENDPOINT PÚBLICO
# ==============================================================

@pytest.mark.django_db
def test_stats_sin_auth_devuelve_200(api_client):
    """El endpoint es público: sin token devuelve 200."""
    response = api_client.get('/api/stats/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_stats_con_token_caducado_sigue_siendo_200(api_client):
    """Un token caducado no debe romper el endpoint público."""
    api_client.credentials(HTTP_AUTHORIZATION='Bearer token_invalido_123')
    response = api_client.get('/api/stats/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_stats_estructura(api_client):
    """Devuelve todos los campos esperados."""
    response = api_client.get('/api/stats/')
    assert response.status_code == status.HTTP_200_OK
    for campo in ('usuarios_activos', 'grupos_formados', 'anuncios_mes', 'matches', 'testimonios'):
        assert campo in response.data


@pytest.mark.django_db
def test_stats_vacio(api_client):
    """Sin datos, todos los contadores son 0 y testimonios []."""
    response = api_client.get('/api/stats/')
    assert response.data['usuarios_activos'] == 0
    assert response.data['grupos_formados'] == 0
    assert response.data['anuncios_mes'] == 0
    assert response.data['matches'] == 0
    assert response.data['testimonios'] == []


# ==============================================================
# CONTADORES
# ==============================================================

@pytest.mark.django_db
def test_usuarios_activos_cuenta_perfiles_usuario(api_client, perfil_ana, perfil_luis):
    """Cuenta perfiles tipo='usuario', no otros tipos."""
    # Creamos un perfil tipo 'grupo' (no debe contar)
    Perfil.objects.create(
        nombre='Banda', apellido='X', correo='banda@test.com',
        descripcion='Test', tipo='grupo',
    )
    response = api_client.get('/api/stats/')
    # Solo Ana y Luis son tipo='usuario' (2)
    assert response.data['usuarios_activos'] == 2


@pytest.mark.django_db
def test_grupos_formados_cuenta_grupos_con_miembro(api_client, perfil_ana):
    """Cuenta grupos con al menos 1 miembro, no grupos vacíos."""
    g_con = Grupo.objects.create(nombre='Con miembro')
    Grupo.objects.create(nombre='Vacío')
    PerfilGrupo.objects.create(perfil=perfil_ana, grupo=g_con)

    response = api_client.get('/api/stats/')
    assert response.data['grupos_formados'] == 1


@pytest.mark.django_db
def test_anuncios_mes_cuenta_ultimos_30_dias(api_client, perfil_ana, tipo_anuncio):
    """Cuenta anuncios con fecha_publicacion en los últimos 30 días."""
    Anuncio.objects.create(
        titulo='Reciente', contenido='Test test test',
        perfil=perfil_ana, tipo_anuncio=tipo_anuncio,
    )
    # Anuncio antiguo (fecha manual, aunque auto_now_add no lo permite en create;
    # usamos update para forzar la fecha)
    antiguo = Anuncio.objects.create(
        titulo='Antiguo', contenido='Test test test',
        perfil=perfil_ana, tipo_anuncio=tipo_anuncio,
    )
    Anuncio.objects.filter(pk=antiguo.pk).update(
        fecha_publicacion='2020-01-01T00:00:00Z',
    )

    response = api_client.get('/api/stats/')
    assert response.data['anuncios_mes'] == 1


@pytest.mark.django_db
def test_matches_cuenta_chats_con_mensaje(api_client, perfil_ana, perfil_luis, chat_ana_luis):
    """Cuenta chats con al menos 1 mensaje, no chats vacíos."""
    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_ana, contenido='Hola')
    # Chat vacío (no debe contar)
    Chat.objects.create()

    response = api_client.get('/api/stats/')
    assert response.data['matches'] == 1


# ==============================================================
# TESTIMONIOS
# ==============================================================

@pytest.mark.django_db
def test_testimonios_anonimizados(api_client, perfil_luis):
    """Los testimonios muestran nombre + inicial, nunca correo ni perfil_id."""
    perfil_luis.testimonio = 'Esta plataforma me ha ayudado a encontrar gente con la que tocar. Muy recomendable.'
    perfil_luis.save()

    response = api_client.get('/api/stats/')
    testimonios = response.data['testimonios']
    assert len(testimonios) == 1
    t = testimonios[0]
    assert t['nombre'] == 'Luis F.'
    assert 'correo' not in t
    assert 'perfil_id' not in t
    assert '@' not in t['nombre']


@pytest.mark.django_db
def test_testimonios_filtra_cortos(api_client, perfil_luis):
    """Testimonios de menos de 40 caracteres no aparecen."""
    perfil_luis.testimonio = 'Corto'
    perfil_luis.save()

    response = api_client.get('/api/stats/')
    assert response.data['testimonios'] == []


@pytest.mark.django_db
def test_testimonios_max_3(api_client, perfil_ana, perfil_luis, perfil_marta):
    """Máximo 3 testimonios, aunque haya más perfiles con testimonio."""
    for p in [perfil_ana, perfil_luis, perfil_marta]:
        p.testimonio = 'Este es un testimonio de prueba suficientemente largo para aparecer en el landing.'
        p.save()
    # Añadimos otro perfil más
    from apps.perfiles.models import Perfil
    p4 = Perfil.objects.create(
        nombre='Otro', apellido='Perfil', correo='otro@test.com',
        descripcion='Test', tipo='usuario',
        testimonio='Otro testimonio de prueba suficientemente largo para el landing.',
    )

    response = api_client.get('/api/stats/')
    assert len(response.data['testimonios']) == 3


@pytest.mark.django_db
def test_testimonios_sin_testimonio_no_aparecen(api_client, perfil_luis):
    """Perfiles sin testimonio no aparecen."""
    perfil_luis.testimonio = None
    perfil_luis.save()

    response = api_client.get('/api/stats/')
    assert response.data['testimonios'] == []


# ==============================================================
# CACHÉ
# ==============================================================

@pytest.mark.django_db
def test_stats_cachea_resultado(api_client, perfil_ana, perfil_luis, django_assert_num_queries):
    """La segunda llamada no toca BD (sirve de caché)."""
    # Primera llamada: cachea
    api_client.get('/api/stats/')
    # Segunda llamada: no debería tocar BD (caché)
    with django_assert_num_queries(0):
        response = api_client.get('/api/stats/')
    assert response.status_code == 200
    assert response.data['usuarios_activos'] == 2


@pytest.mark.django_db
def test_invalidate_cache_por_signal_perfil(api_client, perfil_ana, perfil_luis):
    """Crear un Perfil invalida la caché."""
    # Cargar stats (cachea con 2 usuarios)
    r1 = api_client.get('/api/stats/')
    assert r1.data['usuarios_activos'] == 2

    # Crear un nuevo perfil (debe invalidar)
    Perfil.objects.create(
        nombre='Nuevo', apellido='Perfil', correo='nuevo@test.com',
        descripcion='Test', tipo='usuario',
    )

    # Nueva llamada debe reflejar el cambio
    r2 = api_client.get('/api/stats/')
    assert r2.data['usuarios_activos'] == 3


@pytest.mark.django_db
def test_invalidate_cache_por_signal_mensaje(api_client, perfil_ana, perfil_luis, chat_ana_luis):
    """Crear un Mensaje invalida la caché (matches)."""
    r1 = api_client.get('/api/stats/')
    assert r1.data['matches'] == 0

    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_ana, contenido='Hola')

    r2 = api_client.get('/api/stats/')
    assert r2.data['matches'] == 1


# ── usuarios_online (M.1) ──
from apps.usuarios.presence import mark_online, mark_offline, count_online, PRESENCE_KEY


@pytest.fixture(autouse=True)
def _limpiar_presence():
    """Limpia la presencia entre tests."""
    from django_redis import get_redis_connection
    try:
        redis = get_redis_connection('default')
        redis.delete(PRESENCE_KEY)
    except Exception:
        pass
    yield
    try:
        redis = get_redis_connection('default')
        redis.delete(PRESENCE_KEY)
    except Exception:
        pass


@pytest.mark.django_db
def test_usuarios_online_vacio(api_client):
    response = api_client.get('/api/stats/')
    assert response.data['usuarios_online'] == 0


@pytest.mark.django_db
def test_usuarios_online_con_perfiles(api_client, perfil_ana, perfil_luis):
    mark_online(perfil_ana.perfil_id)
    mark_online(perfil_luis.perfil_id)
    response = api_client.get('/api/stats/')
    assert response.data['usuarios_online'] == 2


@pytest.mark.django_db
def test_usuarios_online_ignora_viejos(api_client, perfil_ana, perfil_luis):
    import time
    from django_redis import get_redis_connection
    redis = get_redis_connection('default')
    # Ana online ahora, Luis online hace 10 min
    now = int(time.time())
    redis.zadd(PRESENCE_KEY, {str(perfil_ana.perfil_id): now, str(perfil_luis.perfil_id): now - 600})
    response = api_client.get('/api/stats/')
    assert response.data['usuarios_online'] == 1


@pytest.mark.django_db
def test_usuarios_online_offline(api_client, perfil_ana):
    mark_online(perfil_ana.perfil_id)
    assert count_online() == 1
    mark_offline(perfil_ana.perfil_id)
    assert count_online() == 0
    response = api_client.get('/api/stats/')
    assert response.data['usuarios_online'] == 0

@pytest.mark.django_db
def test_invalidate_cache_por_signal_perfil_testimonio(api_client, perfil_luis):
    """Guardar un Perfil con testimonio invalida la caché (testimonios)."""
    # Primera llamada: cachea (sin testimonios)
    r1 = api_client.get('/api/stats/')
    assert r1.data['testimonios'] == []

    # Actualizar testimonio
    perfil_luis.testimonio = 'Este es un testimonio de prueba suficientemente largo para aparecer.'
    perfil_luis.save()

    # Nueva llamada: debe reflejar el testimonio (caché invalidada por signal de Perfil)
    r2 = api_client.get('/api/stats/')
    assert len(r2.data['testimonios']) == 1