import pytest
from django.core.cache import cache
from django.core.management import call_command
from django.core.management.base import CommandError
from django.utils import timezone
from rest_framework.test import APIClient

from apps.anuncios.models import Anuncio
from apps.catalogo.comarcas_catalunya import cargar_comarcas
from apps.catalogo.generos_musicales import cargar_generos
from apps.catalogo.models import Comarca, Ciudad, GeneroMusical
from apps.catalogo.municipios_catalunya import cargar_municipios
from apps.chats.models import Chat, Mensaje
from apps.eventos.models import Evento
from apps.locales.models import Local
from apps.perfiles.models import Perfil, PerfilChat
from apps.usuarios.models import Usuario

pytestmark = pytest.mark.django_db

DEMO_PASSWORD = 'clave-de-prueba-' + 'x9'  # solo para los tests


@pytest.fixture(autouse=True)
def modo_desarrollo(settings):
    # pytest-django fuerza DEBUG=False; el comando solo corre con DEBUG=True
    settings.DEBUG = True
    cache.clear()


@pytest.fixture(autouse=True)
def catalogos(db):
    # Los tests corren con --nomigrations: se cargan los catálogos como lo hacen las migraciones
    cargar_comarcas(Comarca)
    cargar_municipios(Ciudad, Comarca)
    cargar_generos(GeneroMusical)


def conteos():
    return (
        Usuario.objects.count(), Perfil.objects.count(), Anuncio.objects.count(),
        Evento.objects.count(), Chat.objects.count(), Mensaje.objects.count(),
    )


def test_crea_perfiles_de_los_tres_tipos_con_contenido():
    call_command('seed_demo', password=DEMO_PASSWORD)
    assert Perfil.objects.filter(tipo='usuario').count() >= 10
    assert Perfil.objects.filter(tipo='grupo').count() >= 3
    assert Local.objects.count() >= 3
    assert Anuncio.objects.count() >= 30
    assert Evento.objects.count() >= 15
    assert Chat.objects.count() >= 8
    assert Evento.objects.filter(fecha_inicio__gt=timezone.now()).exists()


def test_cuentas_marcadas_como_ejemplo():
    call_command('seed_demo', password=DEMO_PASSWORD)
    clasicas = ['ana', 'luis', 'marta']
    assert not Usuario.objects.exclude(nickname__startswith='demo_').exclude(nickname__in=clasicas).exists()
    assert not Perfil.objects.exclude(correo__endswith='@ejemplo.test').exclude(usuario__nickname__in=clasicas).exists()
    usuario = Usuario.objects.get(nickname='demo_nuria')
    assert usuario.check_password(DEMO_PASSWORD)


def test_se_puede_repetir_sin_duplicar():
    call_command('seed_demo', password=DEMO_PASSWORD)
    antes = conteos()
    call_command('seed_demo', password=DEMO_PASSWORD)
    assert conteos() == antes


def test_no_toca_catalogos_ni_datos_reales():
    real = Usuario.objects.create_user(nickname='real_user', password='x12345678')
    Perfil.objects.create(nombre='Real', correo='real@correo.es', descripcion='Perfil real', usuario=real)
    comarcas, ciudades, generos = Comarca.objects.count(), Ciudad.objects.count(), GeneroMusical.objects.count()

    call_command('seed_demo', password=DEMO_PASSWORD)

    assert Usuario.objects.filter(nickname='real_user').exists()
    assert Comarca.objects.count() == comarcas
    assert Ciudad.objects.count() == ciudades
    assert GeneroMusical.objects.count() == generos


def test_borrar_quita_solo_lo_demo():
    real = Usuario.objects.create_user(nickname='real_user', password='x12345678')
    perfil_real = Perfil.objects.create(nombre='Real', correo='real@correo.es', descripcion='Perfil real', usuario=real)
    Anuncio.objects.create(titulo='Anuncio real', contenido='Texto', perfil=perfil_real)
    chat_real = Chat.objects.create()

    call_command('seed_demo', password=DEMO_PASSWORD)
    call_command('seed_demo', '--borrar')

    assert not Usuario.objects.filter(nickname__startswith='demo_').exists()
    assert not Perfil.objects.filter(correo__endswith='@ejemplo.test').exists()
    assert Anuncio.objects.filter(titulo='Anuncio real').exists()
    assert Usuario.objects.filter(nickname='real_user').exists()
    assert Evento.objects.count() == 0
    assert Chat.objects.filter(pk=chat_real.pk).exists()
    assert Chat.objects.count() == 3  # el real + los 2 de ana/luis/marta; los chats demo no quedan huérfanos


def test_se_niega_a_ejecutar_en_produccion(settings):
    settings.DEBUG = False
    with pytest.raises(CommandError):
        call_command('seed_demo', password=DEMO_PASSWORD)
    with pytest.raises(CommandError):
        call_command('seed_demo', '--borrar')
    assert Usuario.objects.count() == 0


def test_match_devuelve_sugerencias_con_motivos():
    call_command('seed_demo', password=DEMO_PASSWORD)
    cliente = APIClient()
    token = cliente.post('/api/auth/login/', {'usuario': 'demo_nuria', 'password': DEMO_PASSWORD}, format='json')
    assert token.status_code == 200, token.content
    cliente.credentials(HTTP_AUTHORIZATION=f"Bearer {token.json()['token']}")

    for busco in ('musico', 'grupo', 'ensayo', 'tocar', 'anuncios'):
        r = cliente.get('/api/match/', {'busco': busco})
        assert r.status_code == 200, (busco, r.content)
        assert r.json()['count'] > 0, f'Match "{busco}" sin sugerencias'


def test_portada_recibe_testimonios_de_ejemplo():
    call_command('seed_demo', password=DEMO_PASSWORD)
    r = APIClient().get('/api/stats/')
    assert r.status_code == 200
    assert len(r.json()['testimonios']) >= 1


def test_sin_password_genera_una_aleatoria_y_la_imprime(capsys, monkeypatch):
    monkeypatch.delenv('DEMO_PASSWORD', raising=False)
    call_command('seed_demo')
    salida = capsys.readouterr().out
    usuario = Usuario.objects.get(nickname='demo_nuria')
    assert not usuario.check_password(DEMO_PASSWORD)
    clave = salida.split('contraseña ')[1].splitlines()[0]
    assert len(clave) >= 12 and usuario.check_password(clave)


def test_password_desde_variable_de_entorno(monkeypatch):
    monkeypatch.setenv('DEMO_PASSWORD', DEMO_PASSWORD)
    call_command('seed_demo')
    assert Usuario.objects.get(nickname='demo_nuria').check_password(DEMO_PASSWORD)


def test_crea_las_cuentas_clasicas_ana_luis_marta():
    call_command('seed_demo', password=DEMO_PASSWORD)
    for nick, clave in (('ana', 'ana123'), ('luis', 'luis123'), ('marta', 'marta123')):
        assert Usuario.objects.get(nickname=nick).check_password(clave)
    assert PerfilChat.objects.filter(perfil__usuario__nickname='ana').exists()
    assert Anuncio.objects.filter(titulo='Vendo guitarra eléctrica').exists()


def test_no_borra_datos_existentes_ni_duplica():
    real = Usuario.objects.create_user(nickname='ana', password='clave-real-1234')
    otro = Usuario.objects.create_user(nickname='otra_persona', password='clave-real-1234')
    call_command('seed_demo', password=DEMO_PASSWORD)
    primero = conteos()
    call_command('seed_demo', password=DEMO_PASSWORD)
    assert conteos() == primero
    assert Usuario.objects.filter(pk=otro.pk).exists()
    assert Usuario.objects.get(pk=real.pk).check_password('clave-real-1234')  # no se pisa
    assert GeneroMusical.objects.count() > 30  # el catálogo de migraciones sigue intacto


def test_borrar_no_toca_ana_luis_marta():
    call_command('seed_demo', password=DEMO_PASSWORD)
    call_command('seed_demo', '--borrar')
    assert not Usuario.objects.filter(nickname__startswith='demo_').exists()
    assert Usuario.objects.filter(nickname__in=['ana', 'luis', 'marta']).count() == 3
