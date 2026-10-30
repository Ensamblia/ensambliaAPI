import pytest

from apps.catalogo.comarcas_catalunya import COMARCAS_CATALUNYA, cargar_comarcas
from apps.catalogo.models import Ciudad, Comarca
from apps.catalogo.municipios_catalunya import MUNICIPIOS_CATALUNYA, cargar_municipios


@pytest.mark.django_db
def test_carga_los_947_municipios_con_su_comarca():
    cargar_comarcas(Comarca)
    cargar_municipios(Ciudad, Comarca)
    assert Ciudad.objects.count() == 947
    assert Ciudad.objects.filter(comarca__isnull=True).count() == 0
    assert Ciudad.objects.get(nombre='Barcelona').comarca.nombre == 'Barcelonès'
    assert Ciudad.objects.get(nombre='Vielha e Mijaran').comarca.nombre == "Val d'Aran"
    assert Ciudad.objects.get(nombre='Prats de Lluçanès').comarca.nombre == 'Lluçanès'


@pytest.mark.django_db
def test_no_duplica_ni_borra_las_existentes():
    cargar_comarcas(Comarca)
    propia = Ciudad.objects.create(nombre='Ciudad de prueba')
    Ciudad.objects.create(nombre='girona')  # ya existe con otra capitalización
    cargar_municipios(Ciudad, Comarca)
    cargar_municipios(Ciudad, Comarca)
    assert Ciudad.objects.filter(pk=propia.pk).exists()
    assert Ciudad.objects.filter(nombre__iexact='Girona').count() == 1
    assert Ciudad.objects.count() == 948


def test_lista_sin_repetidos_y_con_comarcas_oficiales():
    nombres = [n.lower() for n, _ in MUNICIPIOS_CATALUNYA]
    assert len(nombres) == 947
    assert len(set(nombres)) == 947
    comarcas = {c.lower() for c in COMARCAS_CATALUNYA}
    assert {c.lower() for _, c in MUNICIPIOS_CATALUNYA} == comarcas
    # El campo nombre de Ciudad admite 75 caracteres
    assert max(len(n) for n, _ in MUNICIPIOS_CATALUNYA) <= 75
