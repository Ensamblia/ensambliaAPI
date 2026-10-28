import pytest
from rest_framework import status
from apps.catalogo.models import Ciudad, Comarca
from apps.perfiles.models import Perfil, PerfilGeneroMusical
from apps.locales.models import Local
from apps.usuarios.models import Usuario

URL = '/api/locales/'


def crear_local(nombre, ciudad, aforo, tipos, generos=()):
    usuario = Usuario.objects.create_user(nickname=nombre.lower().replace(' ', '_'), password='x12345')
    perfil = Perfil.objects.create(
        nombre=nombre, apellido='', correo=f'{usuario.nickname}@test.com',
        descripcion=f'Descripcion de {nombre}', usuario=usuario, tipo='local',
    )
    Local.objects.create(perfil=perfil, ciudad=ciudad, direccion='C/ X', aforo=aforo, tipos=tipos)
    for g in generos:
        PerfilGeneroMusical.objects.create(perfil=perfil, genero=g)
    return perfil


@pytest.fixture
def escenario(db, comarca, genero_rock, genero_jazz):
    """3 locales: Madrid+Rock (200, sala/bar), Madrid sin géneros (50, ensayo),
    otra comarca+Rock (800, teatro)."""
    otra = Comarca.objects.create(nombre='Toledo')
    getafe = Ciudad.objects.create(nombre='Getafe', comarca=comarca)
    talavera = Ciudad.objects.create(nombre='Talavera', comarca=otra)
    return {
        'otra': otra,
        'getafe': getafe,
        'talavera': talavera,
        'madrid_rock': crear_local('Sala Rock', getafe, 200, ['sala', 'bar'], [genero_rock]),
        'madrid_ensayo': crear_local('Local Ensayo', getafe, 50, ['ensayo']),
        'toledo_rock': crear_local('Teatro Rock', talavera, 800, ['teatro'], [genero_rock, genero_jazz]),
    }


def ids(response):
    return [r['perfil_id'] for r in response.data['results']]


@pytest.mark.django_db
def test_lista_publica_sin_login(api_client, escenario):
    response = api_client.get(URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 3
    assert all(r['generos_comunes'] is None for r in response.data['results'])
    assert response.data['results'][0]['local']['ciudad'] in ('Getafe', 'Talavera')


@pytest.mark.django_db
def test_excluye_local_sin_datos(api_client, escenario, perfil_local_luis):
    response = api_client.get(URL)
    assert perfil_local_luis.perfil_id not in ids(response)


@pytest.mark.django_db
def test_excluye_perfiles_no_local(api_client, escenario, perfil_ana):
    response = api_client.get(URL)
    assert perfil_ana.perfil_id not in ids(response)


@pytest.mark.django_db
def test_filtro_tipo_or(api_client, escenario):
    response = api_client.get(URL, {'tipo': ['ensayo', 'bar']})
    assert set(ids(response)) == {escenario['madrid_rock'].perfil_id, escenario['madrid_ensayo'].perfil_id}


@pytest.mark.django_db
def test_filtro_aforo_min_max(api_client, escenario):
    response = api_client.get(URL, {'aforo_min': 100, 'aforo_max': 500})
    assert ids(response) == [escenario['madrid_rock'].perfil_id]


@pytest.mark.django_db
def test_filtro_ciudad(api_client, escenario):
    response = api_client.get(URL, {'ciudad': escenario['talavera'].ciudad_id})
    assert ids(response) == [escenario['toledo_rock'].perfil_id]


@pytest.mark.django_db
def test_filtro_comarca(api_client, escenario, comarca):
    response = api_client.get(URL, {'comarca': comarca.comarca_id})
    assert set(ids(response)) == {escenario['madrid_rock'].perfil_id, escenario['madrid_ensayo'].perfil_id}


@pytest.mark.django_db
def test_filtro_genero(api_client, escenario, genero_jazz):
    response = api_client.get(URL, {'genero': genero_jazz.genero_musical_id})
    assert ids(response) == [escenario['toledo_rock'].perfil_id]


@pytest.mark.django_db
def test_filtro_genero_varios_sin_duplicados(api_client, escenario, genero_rock, genero_jazz):
    response = api_client.get(URL, {'genero': [genero_rock.genero_musical_id, genero_jazz.genero_musical_id]})
    assert sorted(ids(response)) == sorted([escenario['madrid_rock'].perfil_id, escenario['toledo_rock'].perfil_id])
    assert response.data['count'] == 2


@pytest.mark.django_db
def test_search_nombre(api_client, escenario):
    response = api_client.get(URL, {'search': 'ensayo'})
    assert ids(response) == [escenario['madrid_ensayo'].perfil_id]


@pytest.mark.django_db
def test_orden_afinidad_con_login(client_ana, perfil_ana, escenario, comarca, genero_rock):
    perfil_ana.comarca = comarca
    perfil_ana.save()
    PerfilGeneroMusical.objects.create(perfil=perfil_ana, genero=genero_rock)

    response = client_ana.get(URL)
    assert response.status_code == status.HTTP_200_OK
    assert ids(response) == [
        escenario['madrid_rock'].perfil_id,
        escenario['madrid_ensayo'].perfil_id,
        escenario['toledo_rock'].perfil_id,
    ]
    primero = response.data['results'][0]
    assert primero['misma_comarca'] is True
    assert primero['generos_comunes'] == 1
    ultimo = response.data['results'][2]
    assert ultimo['misma_comarca'] is False
    assert ultimo['generos_comunes'] == 1


@pytest.mark.django_db
def test_orden_afinidad_referencia_sin_comarca(client_ana, perfil_ana, escenario, genero_rock):
    PerfilGeneroMusical.objects.create(perfil=perfil_ana, genero=genero_rock)
    response = client_ana.get(URL)
    assert response.data['results'][-1]['perfil_id'] == escenario['madrid_ensayo'].perfil_id
    assert all(r['misma_comarca'] is False for r in response.data['results'])


@pytest.mark.django_db
def test_login_sin_perfil_sin_afinidad(client_sin_perfil, escenario):
    response = client_sin_perfil.get(URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 3
    assert all(r['generos_comunes'] is None for r in response.data['results'])


@pytest.mark.django_db
@pytest.mark.parametrize('params', [
    {'aforo_min': 'abc'},
    {'aforo_max': '1.5'},
    {'ciudad': 'x'},
    {'comarca': 'x'},
    {'genero': 'x'},
    {'tipo': 'xyz'},
])
def test_param_invalido_400(api_client, escenario, params):
    response = api_client.get(URL, params)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data


# La BD real (SQL original del proyecto) tiene las pivotes con PK compuesta y
# sin columna id: nunca hay que cargar instancias de PerfilGeneroMusical.
@pytest.mark.django_db
@pytest.mark.parametrize('ruta', ['lista', 'detalle', 'sugeridos'])
def test_no_consulta_id_de_pivote_generos(api_client, escenario, ruta):
    from django.db import connection
    from django.test.utils import CaptureQueriesContext
    pid = escenario['madrid_rock'].perfil_id
    urls = {
        'lista': URL,
        'detalle': f'{URL}{pid}/',
        'sugeridos': f'{URL}{pid}/artistas-sugeridos/',
    }
    with CaptureQueriesContext(connection) as ctx:
        response = api_client.get(urls[ruta])
    assert response.status_code == status.HTTP_200_OK
    assert not [q['sql'] for q in ctx.captured_queries if '"perfil_genero_musical"."id"' in q['sql']]


@pytest.mark.django_db
def test_lista_devuelve_generos_del_local(api_client, escenario, genero_rock, genero_jazz):
    response = api_client.get(URL, {'ciudad': escenario['talavera'].ciudad_id})
    assert sorted(response.data['results'][0]['generos']) == sorted(
        [genero_rock.genero_musical_id, genero_jazz.genero_musical_id],
    )


# La comarca de un local sale de su ciudad, aunque perfil.comarca se haya
# sobrescrito después (p. ej. al guardar el formulario general de Mi perfil).
@pytest.mark.django_db
def test_afinidad_usa_comarca_de_la_ciudad_del_local(client_ana, perfil_ana, escenario, comarca):
    perfil_ana.comarca = comarca
    perfil_ana.save()
    Perfil.objects.filter(pk=escenario['madrid_rock'].pk).update(comarca=None)

    response = client_ana.get(URL)
    fila = next(r for r in response.data['results'] if r['perfil_id'] == escenario['madrid_rock'].perfil_id)
    assert fila['misma_comarca'] is True
