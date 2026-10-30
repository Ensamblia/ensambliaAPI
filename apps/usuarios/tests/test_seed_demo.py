import pytest
from django.core.management import call_command

from apps.anuncios.models import Anuncio, TipoAnuncio
from apps.anuncios.tipos_anuncio import cargar_tipos_anuncio
from apps.catalogo.catalogos_musicales import GENEROS_MUSICALES, INSTRUMENTOS, cargar_por_nombre
from apps.catalogo.comarcas_catalunya import cargar_comarcas
from apps.catalogo.models import Ciudad, Comarca, GeneroMusical, Instrumento
from apps.catalogo.municipios_catalunya import cargar_municipios
from apps.eventos.models import Evento
from apps.locales.models import Local
from apps.perfiles.models import Perfil


@pytest.fixture
def catalogos(db):
    # La BD de tests se crea con --nomigrations: cargamos lo que harían las migraciones de datos
    cargar_comarcas(Comarca)
    cargar_municipios(Ciudad, Comarca)
    cargar_por_nombre(Instrumento, INSTRUMENTOS)
    cargar_por_nombre(GeneroMusical, GENEROS_MUSICALES)
    cargar_tipos_anuncio(TipoAnuncio)


@pytest.mark.django_db
def test_seed_demo_crea_contenido_y_se_puede_repetir(catalogos):
    call_command('seed_demo')
    call_command('seed_demo')
    assert Perfil.objects.filter(tipo='usuario').count() == 4
    assert Perfil.objects.filter(tipo='grupo').count() == 1
    assert Local.objects.count() == 3
    assert Anuncio.objects.count() == 5
    assert Anuncio.objects.filter(busqueda__isnull=False).count() == 5
    assert Evento.objects.count() == 4
    assert Local.objects.get(perfil__nombre='Sala Raval').ciudad.nombre == 'Barcelona'


@pytest.mark.django_db
def test_seed_demo_sin_catalogos_falla_con_mensaje():
    from django.core.management.base import CommandError
    with pytest.raises(CommandError, match='migrate'):
        call_command('seed_demo')
