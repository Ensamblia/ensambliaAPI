import pytest
from rest_framework import status
from apps.perfiles.models import Perfil
from apps.locales.models import Local


def url(perfil):
    return f'/api/locales/{perfil.perfil_id}/'


def datos(ciudad, **extra):
    base = {
        'ciudad_id': ciudad.ciudad_id,
        'direccion': 'C/ Mayor 1',
        'aforo': 150,
        'tipos': ['ensayo'],
    }
    base.update(extra)
    return base


# ==============================================================
# GUARDAR DATOS DEL LOCAL (PUT)
# ==============================================================

@pytest.mark.django_db
def test_put_crea_datos_local_dueno(client_luis, perfil_local_luis, ciudad_getafe, comarca):
    response = client_luis.put(url(perfil_local_luis), datos(ciudad_getafe), format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['local']['tipos'] == ['ensayo']
    assert response.data['local']['aforo'] == 150
    perfil_local_luis.refresh_from_db()
    assert perfil_local_luis.comarca_id == comarca.comarca_id


@pytest.mark.django_db
def test_put_actualiza_existente(client_luis, local_luis, ciudad_getafe):
    response = client_luis.put(url(local_luis.perfil), datos(ciudad_getafe, aforo=500), format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['local']['aforo'] == 500
    assert Local.objects.count() == 1


@pytest.mark.django_db
def test_put_ajeno_403(client_ana, perfil_local_luis, ciudad_getafe):
    response = client_ana.put(url(perfil_local_luis), datos(ciudad_getafe), format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert not Local.objects.exists()


@pytest.mark.django_db
def test_put_sin_auth_401(api_client, perfil_local_luis, ciudad_getafe):
    response = api_client.put(url(perfil_local_luis), datos(ciudad_getafe), format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_put_perfil_no_local_400(client_ana, perfil_ana, ciudad_getafe):
    response = client_ana.put(url(perfil_ana), datos(ciudad_getafe), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data


@pytest.mark.django_db
def test_put_perfil_inexistente_404(client_luis, ciudad_getafe):
    response = client_luis.put('/api/locales/999999/', datos(ciudad_getafe), format='json')
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_put_tipos_vacio_400(client_luis, perfil_local_luis, ciudad_getafe):
    response = client_luis.put(url(perfil_local_luis), datos(ciudad_getafe, tipos=[]), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'tipos' in response.data


@pytest.mark.django_db
def test_put_tipos_duplicados_400(client_luis, perfil_local_luis, ciudad_getafe):
    response = client_luis.put(url(perfil_local_luis), datos(ciudad_getafe, tipos=['bar', 'bar']), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'tipos' in response.data


@pytest.mark.django_db
def test_put_tipo_invalido_400(client_luis, perfil_local_luis, ciudad_getafe):
    response = client_luis.put(url(perfil_local_luis), datos(ciudad_getafe, tipos=['discoteca']), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'tipos' in response.data


@pytest.mark.django_db
def test_put_aforo_cero_400(client_luis, perfil_local_luis, ciudad_getafe):
    response = client_luis.put(url(perfil_local_luis), datos(ciudad_getafe, aforo=0), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'aforo' in response.data


@pytest.mark.django_db
def test_put_aforo_opcional(client_luis, perfil_local_luis, ciudad_getafe):
    response = client_luis.put(url(perfil_local_luis), datos(ciudad_getafe, aforo=None), format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['local']['aforo'] is None


@pytest.mark.django_db
def test_put_direccion_vacia_400(client_luis, perfil_local_luis, ciudad_getafe):
    response = client_luis.put(url(perfil_local_luis), datos(ciudad_getafe, direccion='  '), format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'direccion' in response.data


@pytest.mark.django_db
def test_put_ciudad_inexistente_400(client_luis, perfil_local_luis, ciudad_getafe):
    response = client_luis.put(url(perfil_local_luis), {**datos(ciudad_getafe), 'ciudad_id': 999999}, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'ciudad_id' in response.data


@pytest.mark.django_db
def test_put_ciudad_sin_comarca_ok(client_luis, perfil_local_luis, ciudad_sin_comarca):
    response = client_luis.put(url(perfil_local_luis), datos(ciudad_sin_comarca), format='json')
    assert response.status_code == status.HTTP_200_OK
    perfil_local_luis.refresh_from_db()
    assert perfil_local_luis.comarca_id is None


# ==============================================================
# DETALLE (GET)
# ==============================================================

@pytest.mark.django_db
def test_get_detalle_local(api_client, local_luis, comarca):
    response = api_client.get(url(local_luis.perfil))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['nombre'] == 'Sala Rock'
    assert response.data['local']['ciudad'] == 'Getafe'
    assert response.data['local']['comarca_id'] == comarca.comarca_id
    assert response.data['local']['tipos'] == ['sala', 'bar']
    assert response.data['generos_comunes'] is None


@pytest.mark.django_db
def test_get_detalle_local_sin_datos(api_client, perfil_local_luis):
    response = api_client.get(url(perfil_local_luis))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['local'] is None


@pytest.mark.django_db
def test_get_detalle_perfil_no_local_404(api_client, perfil_ana):
    response = api_client.get(url(perfil_ana))
    assert response.status_code == status.HTTP_404_NOT_FOUND
