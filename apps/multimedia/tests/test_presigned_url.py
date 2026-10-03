import pytest
from rest_framework import status


# ==============================================================
# PRESIGNED URL
# ==============================================================

@pytest.mark.django_db
def test_presigned_url_ok(client_ana, perfil_ana):
    """Genera URL prefirmada correctamente."""
    response = client_ana.post('/api/multimedias/presigned-url/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
        'tamano_bytes': 1024,
    })
    assert response.status_code == status.HTTP_200_OK
    assert 'upload_url' in response.data
    assert 'object_key' in response.data
    assert 'archivo_url' in response.data
    assert response.data['object_key'].startswith('multimedia/')


@pytest.mark.django_db
def test_presigned_url_sin_auth(api_client):
    """Sin token → 401."""
    response = api_client.post('/api/multimedias/presigned-url/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_presigned_url_sin_perfil(client_sin_perfil):
    """Sin perfil → 403."""
    response = client_sin_perfil.post('/api/multimedias/presigned-url/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_presigned_url_sin_nombre(client_ana, perfil_ana):
    """Sin nombre → 400."""
    response = client_ana.post('/api/multimedias/presigned-url/', {
        'content_type': 'image/jpeg',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_presigned_url_imagen_demasiado_grande(client_ana, perfil_ana):
    """Imagen > 10MB → 400."""
    response = client_ana.post('/api/multimedias/presigned-url/', {
        'nombre': 'grande.jpg',
        'content_type': 'image/jpeg',
        'tamano_bytes': 11 * 1024 * 1024,  # 11 MB
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'MB' in str(response.data)


@pytest.mark.django_db
def test_presigned_url_audio_ok_50mb(client_ana, perfil_ana):
    """Audio <= 50MB → OK."""
    response = client_ana.post('/api/multimedias/presigned-url/', {
        'nombre': 'cancion.mp3',
        'content_type': 'audio/mpeg',
        'tamano_bytes': 40 * 1024 * 1024,  # 40 MB
    })
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_presigned_url_audio_demasiado_grande(client_ana, perfil_ana):
    """Audio > 50MB → 400."""
    response = client_ana.post('/api/multimedias/presigned-url/', {
        'nombre': 'cancion.mp3',
        'content_type': 'audio/mpeg',
        'tamano_bytes': 51 * 1024 * 1024,  # 51 MB
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST