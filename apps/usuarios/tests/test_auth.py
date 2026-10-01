import pytest
from rest_framework import status
from apps.usuarios.models import Usuario


# ==============================================================
# REGISTRO
# ==============================================================

@pytest.mark.django_db
def test_registro_ok(api_client):
    """Registrar un usuario nuevo devuelve 201 y un token."""
    response = api_client.post('/api/auth/register/', {
        'usuario': 'nuevo',
        'password': 'nuevo123',
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert 'token' in response.data
    assert response.data['usuario']['usuario'] == 'nuevo'
    assert Usuario.objects.filter(nickname='nuevo').exists()


@pytest.mark.django_db
def test_registro_usuario_duplicado(api_client, ana):
    """Registrar un usuario ya existente devuelve 409."""
    response = api_client.post('/api/auth/register/', {
        'usuario': 'ana',
        'password': 'otra123',
    })
    assert response.status_code == status.HTTP_409_CONFLICT
    assert 'Username in use' in str(response.data)


@pytest.mark.django_db
def test_registro_sin_usuario(api_client):
    """Registrar sin usuario devuelve 400."""
    response = api_client.post('/api/auth/register/', {
        'password': 'solo_password',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_registro_sin_password(api_client):
    """Registrar sin password devuelve 400."""
    response = api_client.post('/api/auth/register/', {
        'usuario': 'solo_usuario',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_registro_usuario_corto(api_client):
    """Usuario con menos de 3 caracteres devuelve 400."""
    response = api_client.post('/api/auth/register/', {
        'usuario': 'ab',
        'password': 'password123',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_registro_password_corto(api_client):
    """Password con menos de 6 caracteres devuelve 400."""
    response = api_client.post('/api/auth/register/', {
        'usuario': 'nuevo',
        'password': '123',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================
# LOGIN
# ==============================================================

@pytest.mark.django_db
def test_login_ok(api_client, ana):
    """Login con credenciales correctas devuelve 200 y token."""
    response = api_client.post('/api/auth/login/', {
        'usuario': 'ana',
        'password': 'ana123',
    })
    assert response.status_code == status.HTTP_200_OK
    assert 'token' in response.data
    assert len(response.data['token']) > 50


@pytest.mark.django_db
def test_login_password_incorrecta(api_client, ana):
    """Login con password incorrecta devuelve 401."""
    response = api_client.post('/api/auth/login/', {
        'usuario': 'ana',
        'password': 'incorrecta',
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_login_usuario_inexistente(api_client, db):
    """Login con usuario que no existe devuelve 401."""
    response = api_client.post('/api/auth/login/', {
        'usuario': 'no_existe',
        'password': 'da_igual',
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_login_sin_usuario(api_client):
    """Login sin usuario devuelve 400."""
    response = api_client.post('/api/auth/login/', {
        'password': 'solo_password',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_login_sin_password(api_client):
    """Login sin password devuelve 400."""
    response = api_client.post('/api/auth/login/', {
        'usuario': 'solo_usuario',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================
# TOKEN
# ==============================================================

@pytest.mark.django_db
def test_token_valido_en_endpoint_protegido(api_client, ana, perfil_ana):
    """Un token válido permite acceder a un endpoint protegido."""
    # Login
    response = api_client.post('/api/auth/login/', {
        'usuario': 'ana',
        'password': 'ana123',
    })
    token = response.data['token']

    # Petición protegida
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    response = api_client.get('/api/perfiles/me/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_token_invalido(api_client):
    """Un token inválido devuelve 401."""
    api_client.credentials(HTTP_AUTHORIZATION='Bearer token_invalido_123')
    response = api_client.get('/api/perfiles/me/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_sin_token(api_client):
    """Sin token devuelve 401."""
    response = api_client.get('/api/perfiles/me/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_token_mal_formado(api_client):
    """Un Authorization sin 'Bearer ' devuelve 401."""
    api_client.credentials(HTTP_AUTHORIZATION='solo_token_sin_bearer')
    response = api_client.get('/api/perfiles/me/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED