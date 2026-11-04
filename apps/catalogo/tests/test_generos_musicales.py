import pytest

from apps.catalogo.generos_musicales import GENEROS_MUSICALES, cargar_generos
from apps.catalogo.models import GeneroMusical


@pytest.mark.django_db
def test_carga_todos_los_generos():
    GeneroMusical.objects.all().delete()  # la migración ya los carga en la BD de tests
    cargar_generos(GeneroMusical)
    assert GeneroMusical.objects.count() == len(GENEROS_MUSICALES)
    assert GeneroMusical.objects.filter(nombre='Rumba catalana').exists()
    assert GeneroMusical.objects.filter(nombre='Jazz').exists()


@pytest.mark.django_db
def test_no_duplica_ni_borra_los_existentes():
    GeneroMusical.objects.all().delete()
    propio = GeneroMusical.objects.create(nombre='Género de prueba')
    GeneroMusical.objects.create(nombre='rock')  # ya existe con otra capitalización
    cargar_generos(GeneroMusical)
    cargar_generos(GeneroMusical)
    assert GeneroMusical.objects.filter(pk=propio.pk).exists()
    assert GeneroMusical.objects.filter(nombre__iexact='Rock').count() == 1
    assert GeneroMusical.objects.count() == len(GENEROS_MUSICALES) + 1


def test_lista_sin_repetidos():
    assert len({g.lower() for g in GENEROS_MUSICALES}) == len(GENEROS_MUSICALES)
    assert all(len(g) <= 50 for g in GENEROS_MUSICALES)
