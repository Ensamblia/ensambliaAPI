import pytest

from apps.catalogo.comarcas_catalunya import COMARCAS_CATALUNYA, cargar_comarcas
from apps.catalogo.models import Comarca


@pytest.mark.django_db
def test_carga_las_43_comarcas():
    cargar_comarcas(Comarca)
    assert Comarca.objects.count() == 43
    assert Comarca.objects.filter(nombre='Barcelonès').exists()
    assert Comarca.objects.filter(nombre='Lluçanès').exists()


@pytest.mark.django_db
def test_no_duplica_ni_borra_las_existentes():
    propia = Comarca.objects.create(nombre='Comarca de prueba')
    Comarca.objects.create(nombre='osona')  # ya existe con otra capitalización
    cargar_comarcas(Comarca)
    cargar_comarcas(Comarca)
    assert Comarca.objects.filter(pk=propia.pk).exists()
    assert Comarca.objects.filter(nombre__iexact='Osona').count() == 1
    assert Comarca.objects.count() == 44


def test_lista_sin_repetidas():
    assert len(COMARCAS_CATALUNYA) == 43
    assert len({c.lower() for c in COMARCAS_CATALUNYA}) == 43
