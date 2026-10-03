import pytest
from rest_framework import status
from apps.multimedia.models import Multimedia


# ==============================================================
# CREAR (registro tras subida a MinIO)
# ==============================================================

@pytest.mark.django_db
def test_crear_multimedia_ok(client_ana, perfil_ana, tipo_archivo):
    """Registra un multimedia con un object_key existente en MinIO."""
    response = client_ana.post('/api/multimedias/', {
        'nombre': 'mi-foto.jpg',
        'archivo': 'multimedia/2026/10/abc.jpg',
        'tamano_bytes': 1024,
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['nombre'] == 'mi-foto.jpg'
    assert response.data['perfil_id'] == perfil_ana.perfil_id
    assert Multimedia.objects.filter(nombre='mi-foto.jpg').exists()


@pytest.mark.django_db
def test_crear_multimedia_sin_auth(api_client):
    """Sin token → 401."""
    response = api_client.post('/api/multimedias/', {
        'nombre': 'x.jpg',
        'archivo': 'multimedia/x.jpg',
        'tamano_bytes': 100,
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_crear_multimedia_sin_perfil(client_sin_perfil):
    """Sin perfil → 403."""
    response = client_sin_perfil.post('/api/multimedias/', {
        'nombre': 'x.jpg',
        'archivo': 'multimedia/x.jpg',
        'tamano_bytes': 100,
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_multimedia_sin_archivo(client_ana, perfil_ana):
    """Sin archivo → 400."""
    response = client_ana.post('/api/multimedias/', {
        'nombre': 'x.jpg',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_crear_multimedia_sin_nombre(client_ana, perfil_ana):
    """Sin nombre → 400."""
    response = client_ana.post('/api/multimedias/', {
        'archivo': 'multimedia/x.jpg',
        'tamano_bytes': 100,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_crear_multimedia_nombre_corto(client_ana, perfil_ana):
    """Nombre vacío → 400."""
    response = client_ana.post('/api/multimedias/', {
        'nombre': '   ',
        'archivo': 'multimedia/x.jpg',
        'tamano_bytes': 100,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================
# LISTAR / OBTENER
# ==============================================================

@pytest.mark.django_db
def test_listar_multimedia_publico(api_client, perfil_ana):
    """Cualquiera puede listar multimedia."""
    Multimedia.objects.create(
        nombre='x.jpg', archivo='multimedia/x.jpg',
        tamano_bytes=100, perfil=perfil_ana,
    )
    response = api_client.get('/api/multimedias/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_obtener_multimedia_por_id(api_client, perfil_ana):
    m = Multimedia.objects.create(
        nombre='x.jpg', archivo='multimedia/x.jpg',
        tamano_bytes=100, perfil=perfil_ana,
    )
    response = api_client.get(f'/api/multimedias/{m.multimedia_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['nombre'] == 'x.jpg'


@pytest.mark.django_db
def test_obtener_multimedia_inexistente(api_client):
    response = api_client.get('/api/multimedias/99999/')
    assert response.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================
# POR PERFIL
# ==============================================================

@pytest.mark.django_db
def test_listar_multimedia_por_perfil(api_client, perfil_ana):
    Multimedia.objects.create(
        nombre='a.jpg', archivo='multimedia/a.jpg',
        tamano_bytes=100, perfil=perfil_ana,
    )
    Multimedia.objects.create(
        nombre='b.jpg', archivo='multimedia/b.jpg',
        tamano_bytes=200, perfil=perfil_ana,
    )
    response = api_client.get(f'/api/multimedias/perfil/?perfil_id={perfil_ana.perfil_id}')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2


# ==============================================================
# BORRAR (PROPIEDAD)
# ==============================================================

@pytest.mark.django_db
def test_borrar_mi_multimedia(client_ana, perfil_ana):
    m = Multimedia.objects.create(
        nombre='x.jpg', archivo='multimedia/x.jpg',
        tamano_bytes=100, perfil=perfil_ana,
    )
    response = client_ana.delete(f'/api/multimedias/{m.multimedia_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not Multimedia.objects.filter(multimedia_id=m.multimedia_id).exists()


@pytest.mark.django_db
def test_no_borrar_multimedia_ajena(client_ana, perfil_luis):
    m = Multimedia.objects.create(
        nombre='x.jpg', archivo='multimedia/x.jpg',
        tamano_bytes=100, perfil=perfil_luis,
    )
    response = client_ana.delete(f'/api/multimedias/{m.multimedia_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Multimedia.objects.filter(multimedia_id=m.multimedia_id).exists()