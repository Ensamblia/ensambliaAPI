import pytest

from apps.anuncios.models import TipoAnuncio
from apps.anuncios.tipos_anuncio import TIPOS_ANUNCIO, cargar_tipos_anuncio
from apps.catalogo.catalogos_musicales import (
    GENEROS_MUSICALES, INSTRUMENTOS, cargar_por_nombre,
)
from apps.catalogo.models import GeneroMusical, Instrumento


@pytest.mark.django_db
def test_carga_instrumentos_y_generos_sin_duplicar():
    Instrumento.objects.create(nombre='batería')  # ya existe con otra capitalización
    cargar_por_nombre(Instrumento, INSTRUMENTOS)
    cargar_por_nombre(Instrumento, INSTRUMENTOS)
    cargar_por_nombre(GeneroMusical, GENEROS_MUSICALES)
    assert Instrumento.objects.count() == len(INSTRUMENTOS)
    assert Instrumento.objects.filter(nombre__iexact='Batería').count() == 1
    assert GeneroMusical.objects.count() == len(GENEROS_MUSICALES)


@pytest.mark.django_db
def test_carga_tipos_de_anuncio_sin_borrar_los_propios():
    propio = TipoAnuncio.objects.create(nombre='Tipo propio')
    cargar_tipos_anuncio(TipoAnuncio)
    cargar_tipos_anuncio(TipoAnuncio)
    assert TipoAnuncio.objects.filter(pk=propio.pk).exists()
    assert TipoAnuncio.objects.count() == len(TIPOS_ANUNCIO) + 1


def test_listas_sin_repetidos_y_caben_en_sus_campos():
    for lista, maximo in ((INSTRUMENTOS, 25), (GENEROS_MUSICALES, 50), (TIPOS_ANUNCIO, 50)):
        nombres = [n.lower() for n in lista]
        assert len(nombres) == len(set(nombres))
        assert max(len(n) for n in lista) <= maximo
