import pytest
from rest_framework import status


# ==============================================================
# COMARCAS
# ==============================================================

@pytest.mark.django_db
def test_listar_comarcas_publico(api_client, comarca):
    """Cualquiera puede listar comarcas (sin token)."""
    response = api_client.get('/api/comarcas/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_crear_comarca_sin_auth(api_client):
    """Sin token no se puede crear comarca."""
    response = api_client.post('/api/comarcas/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_crear_comarca_sin_admin(client_ana):
    """Un usuario normal NO puede crear comarca."""
    response = client_ana.post('/api/comarcas/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_comarca_admin(client_admin):
    """Un admin SÍ puede crear comarca."""
    response = client_admin.post('/api/comarcas/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_editar_comarca_sin_admin(client_ana, comarca):
    """Un usuario normal NO puede editar comarca."""
    response = client_ana.put(f'/api/comarcas/{comarca.comarca_id}/', {'nombre': 'Hackeado'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_borrar_comarca_sin_admin(client_ana, comarca):
    """Un usuario normal NO puede borrar comarca."""
    response = client_ana.delete(f'/api/comarcas/{comarca.comarca_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================================================
# INSTRUMENTOS
# ==============================================================

@pytest.mark.django_db
def test_listar_instrumentos_publico(api_client, instrumento_guitarra):
    response = api_client.get('/api/instrumentos/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_crear_instrumento_sin_admin(client_ana):
    response = client_ana.post('/api/instrumentos/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_instrumento_admin(client_admin):
    response = client_admin.post('/api/instrumentos/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_borrar_instrumento_sin_admin(client_ana, instrumento_guitarra):
    response = client_ana.delete(f'/api/instrumentos/{instrumento_guitarra.instrumento_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================================================
# GÉNEROS MUSICALES
# ==============================================================

@pytest.mark.django_db
def test_listar_generos_publico(api_client, genero_rock):
    response = api_client.get('/api/genero_musical/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_crear_genero_sin_admin(client_ana):
    response = client_ana.post('/api/genero_musical/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_genero_admin(client_admin):
    response = client_admin.post('/api/genero_musical/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_201_CREATED


# ==============================================================
# CIUDADES
# ==============================================================

@pytest.mark.django_db
def test_crear_ciudad_sin_admin(client_ana, comarca):
    response = client_ana.post('/api/ciudades/', {'nombre': 'Test', 'comarca_id': comarca.comarca_id})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_ciudad_admin(client_admin, comarca):
    response = client_admin.post('/api/ciudades/', {'nombre': 'Test', 'comarca_id': comarca.comarca_id})
    assert response.status_code == status.HTTP_201_CREATED


# ==============================================================
# TIPOS DE ARCHIVO
# ==============================================================

@pytest.mark.django_db
def test_listar_tipo_archivos_publico(api_client, tipo_archivo):
    response = api_client.get('/api/tipo-archivos/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_crear_tipo_archivo_sin_admin(client_ana):
    response = client_ana.post('/api/tipo-archivos/', {
        'nombre': 'png', 'extension': '.png', 'mime_type': 'image/png',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_tipo_archivo_admin(client_admin):
    response = client_admin.post('/api/tipo-archivos/', {
        'nombre': 'png', 'extension': '.png', 'mime_type': 'image/png',
    })
    assert response.status_code == status.HTTP_201_CREATED


# ==============================================================
# TIPOS DE ANUNCIO
# ==============================================================

@pytest.mark.django_db
def test_listar_tipo_anuncios_publico(api_client, tipo_anuncio):
    response = api_client.get('/api/tipo-anuncios/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_crear_tipo_anuncio_sin_admin(client_ana):
    response = client_ana.post('/api/tipo-anuncios/', {'tipo': 'Test'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_tipo_anuncio_admin(client_admin):
    response = client_admin.post('/api/tipo-anuncios/', {'tipo': 'Test'})
    assert response.status_code == status.HTTP_201_CREATED


# ==============================================================
# GRUPOS
# ==============================================================

@pytest.mark.django_db
def test_listar_grupos_publico(api_client, db):
    response = api_client.get('/api/grupos/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_crear_grupo_sin_admin(client_ana):
    response = client_ana.post('/api/grupos/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_grupo_admin(client_admin):
    response = client_admin.post('/api/grupos/', {'nombre': 'Test'})
    assert response.status_code == status.HTTP_201_CREATED