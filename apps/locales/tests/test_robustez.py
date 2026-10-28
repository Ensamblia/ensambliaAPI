import pytest
from unittest import mock
from rest_framework import status
from apps.catalogo.models import Ciudad
from apps.locales.models import Local
from apps.perfiles.models import Perfil


@pytest.mark.django_db
def test_search_con_caracter_nul_no_da_500(api_client, local_luis):
    response = api_client.get('/api/locales/', {'search': 'Sala\x00Rock'})
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_borrar_ciudad_con_locales_da_409(client_admin, local_luis):
    response = client_admin.delete(f'/api/ciudades/{local_luis.ciudad_id}/')
    assert response.status_code == status.HTTP_409_CONFLICT
    assert 'error' in response.data
    assert Ciudad.objects.filter(pk=local_luis.ciudad_id).exists()


@pytest.mark.django_db
def test_borrar_ciudad_sin_locales_sigue_funcionando(client_admin, ciudad_sin_comarca):
    response = client_admin.delete(f'/api/ciudades/{ciudad_sin_comarca.ciudad_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not Ciudad.objects.filter(pk=ciudad_sin_comarca.ciudad_id).exists()


@pytest.mark.django_db(transaction=True)
def test_put_es_atomico(client_luis, perfil_local_luis, ciudad_getafe):
    """Si falla la copia de la comarca al perfil, no queda un local a medias."""
    with mock.patch.object(Perfil, 'save', side_effect=RuntimeError('fallo')):
        with pytest.raises(RuntimeError):
            client_luis.put(
                f'/api/locales/{perfil_local_luis.perfil_id}/',
                {'ciudad_id': ciudad_getafe.ciudad_id, 'direccion': 'C/ X', 'aforo': 10, 'tipos': ['bar']},
                format='json',
            )
    assert not Local.objects.filter(perfil_id=perfil_local_luis.perfil_id).exists()
