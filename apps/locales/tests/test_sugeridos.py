import pytest
from rest_framework import status
from apps.catalogo.models import Comarca
from apps.perfiles.models import Perfil, PerfilGeneroMusical
from apps.usuarios.models import Usuario


def url(perfil):
    return f'/api/locales/{perfil.perfil_id}/artistas-sugeridos/'


def crear_perfil(nickname, tipo='usuario', comarca=None, generos=(), disponibilidad=True):
    usuario = Usuario.objects.create_user(nickname=nickname, password='x12345')
    perfil = Perfil.objects.create(
        nombre=nickname.capitalize(), apellido='Apellido' if tipo == 'usuario' else '',
        correo=f'{nickname}@test.com', descripcion='Desc', usuario=usuario,
        tipo=tipo, comarca=comarca, disponibilidad=disponibilidad,
    )
    for g in generos:
        PerfilGeneroMusical.objects.create(perfil=perfil, genero=g)
    return perfil


@pytest.fixture
def local_madrid_rock(local_luis, genero_rock):
    PerfilGeneroMusical.objects.create(perfil=local_luis.perfil, genero=genero_rock)
    return local_luis.perfil


def ids(response):
    return [r['perfil_id'] for r in response.data['results']]


@pytest.mark.django_db
def test_sugeridos_orden(api_client, local_madrid_rock, comarca, genero_rock, genero_jazz):
    otra = Comarca.objects.create(nombre='Toledo')
    lejos_rock = crear_perfil('lejos', comarca=otra, generos=[genero_rock])
    cerca_jazz = crear_perfil('cercajazz', comarca=comarca, generos=[genero_jazz])
    cerca_rock = crear_perfil('cercarock', tipo='grupo', comarca=comarca, generos=[genero_rock])

    response = api_client.get(url(local_madrid_rock))
    assert response.status_code == status.HTTP_200_OK
    assert ids(response) == [cerca_rock.perfil_id, cerca_jazz.perfil_id, lejos_rock.perfil_id]
    assert response.data['results'][0]['generos_comunes'] == 1
    assert response.data['results'][0]['misma_comarca'] is True
    assert response.data['results'][0]['tipo'] == 'grupo'


@pytest.mark.django_db
def test_sugeridos_excluye_locales_y_no_disponibles(api_client, local_madrid_rock, comarca):
    otro_local = crear_perfil('otrolocal', tipo='local', comarca=comarca)
    ocupado = crear_perfil('ocupado', comarca=comarca, disponibilidad=False)
    libre = crear_perfil('libre', comarca=comarca)

    response = api_client.get(url(local_madrid_rock))
    assert ids(response) == [libre.perfil_id]
    assert otro_local.perfil_id not in ids(response)
    assert ocupado.perfil_id not in ids(response)


@pytest.mark.django_db
def test_sugeridos_filtro_genero(api_client, local_madrid_rock, comarca, genero_jazz):
    jazz = crear_perfil('jazzista', comarca=comarca, generos=[genero_jazz])
    crear_perfil('sin', comarca=comarca)
    response = api_client.get(url(local_madrid_rock), {'genero': genero_jazz.genero_musical_id})
    assert ids(response) == [jazz.perfil_id]


@pytest.mark.django_db
def test_sugeridos_param_invalido_400(api_client, local_madrid_rock):
    response = api_client.get(url(local_madrid_rock), {'comarca': 'x'})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_sugeridos_perfil_no_local_404(api_client, perfil_ana):
    response = api_client.get(url(perfil_ana))
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_sugeridos_publico_sin_login(api_client, perfil_local_luis):
    response = api_client.get(url(perfil_local_luis))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 0
