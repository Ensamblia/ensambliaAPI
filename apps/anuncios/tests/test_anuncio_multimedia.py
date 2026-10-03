import pytest
from rest_framework import status
from apps.anuncios.models import AnuncioMultimedia
from apps.multimedia.models import Multimedia


@pytest.fixture
def multimedia_ana(perfil_ana):
    return Multimedia.objects.create(
        nombre='x.jpg', archivo='multimedia/x.jpg',
        tamano_bytes=100, perfil=perfil_ana,
    )


# ==============================================================
# VINCULAR
# ==============================================================

@pytest.mark.django_db
def test_vincular_multimedia_ok(client_ana, anuncio_ana, multimedia_ana):
    response = client_ana.post(
        f'/api/anuncios/{anuncio_ana.anuncio_id}/multimedia/',
        {'multimedia_ids': [multimedia_ana.multimedia_id]},
        format='json',
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['multimedia_count'] == 1
    assert response.data['agregados'] == 1
    assert AnuncioMultimedia.objects.filter(anuncio=anuncio_ana).count() == 1


@pytest.mark.django_db
def test_vincular_multimedia_duplicado(
    client_ana, anuncio_ana, multimedia_ana
):
    """Vincular dos veces el mismo no duplica."""
    client_ana.post(
        f'/api/anuncios/{anuncio_ana.anuncio_id}/multimedia/',
        {'multimedia_ids': [multimedia_ana.multimedia_id]},
        format='json',
    )
    response = client_ana.post(
        f'/api/anuncios/{anuncio_ana.anuncio_id}/multimedia/',
        {'multimedia_ids': [multimedia_ana.multimedia_id]},
        format='json',
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert AnuncioMultimedia.objects.filter(anuncio=anuncio_ana).count() == 1


@pytest.mark.django_db
def test_no_vincular_multimedia_de_otro_perfil(
    client_ana, anuncio_ana, perfil_luis
):
    """No puedo vincular un medio de otro perfil."""
    m_luis = Multimedia.objects.create(
        nombre='y.jpg', archivo='multimedia/y.jpg',
        tamano_bytes=100, perfil=perfil_luis,
    )
    response = client_ana.post(
        f'/api/anuncios/{anuncio_ana.anuncio_id}/multimedia/',
        {'multimedia_ids': [m_luis.multimedia_id]},
        format='json',
    )
    # El backend ignora medios que no son del perfil → agregados=0
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['agregados'] == 0
    assert AnuncioMultimedia.objects.filter(anuncio=anuncio_ana).count() == 0


@pytest.mark.django_db
def test_no_vincular_a_anuncio_ajeno(
    client_ana, anuncio_luis, multimedia_ana
):
    """No puedo vincular a un anuncio ajeno."""
    response = client_ana.post(
        f'/api/anuncios/{anuncio_luis.anuncio_id}/multimedia/',
        {'multimedia_ids': [multimedia_ana.multimedia_id]},
        format='json',
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_vincular_multimedia_ids_invalido(client_ana, anuncio_ana):
    """multimedia_ids no es lista → 400."""
    response = client_ana.post(
        f'/api/anuncios/{anuncio_ana.anuncio_id}/multimedia/',
        {'multimedia_ids': 'no-es-lista'},
        format='json',
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_vincular_anuncio_inexistente(client_ana, multimedia_ana):
    response = client_ana.post(
        '/api/anuncios/99999/multimedia/',
        {'multimedia_ids': [multimedia_ana.multimedia_id]},
        format='json',
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================
# DESVINCULAR
# ==============================================================

@pytest.mark.django_db
def test_desvincular_multimedia_ok(client_ana, anuncio_ana, multimedia_ana):
    AnuncioMultimedia.objects.create(
        anuncio=anuncio_ana, multimedia=multimedia_ana,
    )
    response = client_ana.delete(
        f'/api/anuncios/{anuncio_ana.anuncio_id}/multimedia/{multimedia_ana.multimedia_id}/'
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert AnuncioMultimedia.objects.filter(anuncio=anuncio_ana).count() == 0
    # El medio sigue existiendo en la biblioteca
    assert Multimedia.objects.filter(multimedia_id=multimedia_ana.multimedia_id).exists()


@pytest.mark.django_db
def test_desvincular_multimedia_no_vinculada(client_ana, anuncio_ana, multimedia_ana):
    response = client_ana.delete(
        f'/api/anuncios/{anuncio_ana.anuncio_id}/multimedia/{multimedia_ana.multimedia_id}/'
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_no_desvincular_multimedia_de_anuncio_ajeno(
    client_ana, anuncio_luis, perfil_luis
):
    m = Multimedia.objects.create(
        nombre='y.jpg', archivo='multimedia/y.jpg',
        tamano_bytes=100, perfil=perfil_luis,
    )
    AnuncioMultimedia.objects.create(anuncio=anuncio_luis, multimedia=m)
    response = client_ana.delete(
        f'/api/anuncios/{anuncio_luis.anuncio_id}/multimedia/{m.multimedia_id}/'
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert AnuncioMultimedia.objects.filter(anuncio=anuncio_luis).count() == 1


# ==============================================================
# ANUNCIO DEVUELVE MULTIMEDIA
# ==============================================================

@pytest.mark.django_db
def test_anuncio_incluye_multimedias(client_ana, anuncio_ana, multimedia_ana):
    AnuncioMultimedia.objects.create(
        anuncio=anuncio_ana, multimedia=multimedia_ana,
    )
    response = client_ana.get(f'/api/anuncios/{anuncio_ana.anuncio_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert 'multimedias' in response.data
    assert len(response.data['multimedias']) == 1
    assert response.data['multimedias'][0]['multimedia_id'] == multimedia_ana.multimedia_id