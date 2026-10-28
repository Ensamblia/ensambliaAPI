import pytest
from rest_framework import status
from apps.perfiles.models import Perfil


# ==============================================================
# CREAR PERFIL
# ==============================================================

@pytest.mark.django_db
def test_crear_perfil_ok(client_ana, comarca):
    """Un usuario puede crear su perfil."""
    response = client_ana.post('/api/perfiles/', {
        'nombre': 'Ana',
        'apellido': 'Garcia',
        'correo': 'ana@test.com',
        'descripcion': 'Cantante',
        'comarca_id': comarca.comarca_id,
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['nombre'] == 'Ana'
    assert response.data['perfil_id'] is not None


@pytest.mark.django_db
def test_crear_perfil_sin_auth(api_client):
    """Sin autenticación no se puede crear perfil."""
    response = api_client.post('/api/perfiles/', {
        'nombre': 'Test',
        'apellido': 'Test',
        'correo': 'test@test.com',
        'descripcion': 'Test',
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_crear_perfil_correo_invalido(client_ana):
    """Correo inválido devuelve 400."""
    response = client_ana.post('/api/perfiles/', {
        'nombre': 'Ana',
        'apellido': 'Garcia',
        'correo': 'no-es-un-email',
        'descripcion': 'Cantante',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'correo' in response.data


@pytest.mark.django_db
def test_crear_perfil_edad_invalida(client_ana):
    """Edad fuera de rango devuelve 400."""
    response = client_ana.post('/api/perfiles/', {
        'nombre': 'Ana',
        'apellido': 'Garcia',
        'correo': 'ana@test.com',
        'descripcion': 'Cantante',
        'edad': 15,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'edad' in response.data


@pytest.mark.django_db
def test_crear_perfil_sexo_invalido(client_ana):
    """Sexo inválido devuelve 400."""
    response = client_ana.post('/api/perfiles/', {
        'nombre': 'Ana',
        'apellido': 'Garcia',
        'correo': 'ana@test.com',
        'descripcion': 'Cantante',
        'sexo': 'Marciano',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'sexo' in response.data


@pytest.mark.django_db
def test_crear_perfil_telefono_invalido(client_ana):
    """Teléfono inválido devuelve 400."""
    response = client_ana.post('/api/perfiles/', {
        'nombre': 'Ana',
        'apellido': 'Garcia',
        'correo': 'ana@test.com',
        'descripcion': 'Cantante',
        'numero_telefono': 'abc',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_crear_dos_perfiles_personales_falla(client_ana, perfil_ana):
    """Un usuario no puede tener 2 perfiles personales."""
    response = client_ana.post('/api/perfiles/', {
        'nombre': 'Otro',
        'apellido': 'Otro',
        'correo': 'otro@test.com',
        'descripcion': 'Test',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Ya tienes un perfil personal' in str(response.data)


# ==============================================================
# LEER PERFIL
# ==============================================================

@pytest.mark.django_db
def test_listar_perfiles(client_ana, perfil_ana, perfil_luis):
    """Listar perfiles devuelve un array con todos."""
    response = client_ana.get('/api/perfiles/')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 2


@pytest.mark.django_db
def test_obtener_perfil_por_id(client_ana, perfil_luis):
    """Obtener un perfil por ID devuelve 200."""
    response = client_ana.get(f'/api/perfiles/{perfil_luis.perfil_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['nombre'] == 'Luis'


@pytest.mark.django_db
def test_obtener_perfil_inexistente(client_ana):
    """Obtener un perfil que no existe devuelve 404."""
    response = client_ana.get('/api/perfiles/99999/')
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_perfil_me(client_ana, perfil_ana):
    """GET /api/perfiles/me/ devuelve mi perfil."""
    response = client_ana.get('/api/perfiles/me/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['perfil_id'] == perfil_ana.perfil_id


@pytest.mark.django_db
def test_perfil_me_sin_perfil(client_ana):
    """GET /api/perfiles/me/ sin perfil devuelve 404."""
    response = client_ana.get('/api/perfiles/me/')
    assert response.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================
# EDITAR PERFIL
# ==============================================================

@pytest.mark.django_db
def test_editar_mi_perfil(client_ana, perfil_ana):
    """Puedo editar mi propio perfil."""
    response = client_ana.put(f'/api/perfiles/{perfil_ana.perfil_id}/', {
        'nombre': 'Ana María',
        'descripcion': 'Cantante actualizada',
    })
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
    perfil_ana.refresh_from_db()
    assert perfil_ana.nombre == 'Ana María'


@pytest.mark.django_db
def test_no_editar_perfil_ajeno(client_ana, perfil_luis):
    """No puedo editar el perfil de otro usuario."""
    response = client_ana.put(f'/api/perfiles/{perfil_luis.perfil_id}/', {
        'nombre': 'Hackeado',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN
    perfil_luis.refresh_from_db()
    assert perfil_luis.nombre == 'Luis'


# ==============================================================
# BORRAR PERFIL
# ==============================================================

@pytest.mark.django_db
def test_borrar_mi_perfil(client_ana, perfil_ana):
    """Puedo borrar mi propio perfil."""
    response = client_ana.delete(f'/api/perfiles/{perfil_ana.perfil_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not Perfil.objects.filter(perfil_id=perfil_ana.perfil_id).exists()


@pytest.mark.django_db
def test_no_borrar_perfil_ajeno(client_ana, perfil_luis):
    """No puedo borrar el perfil de otro usuario."""
    response = client_ana.delete(f'/api/perfiles/{perfil_luis.perfil_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Perfil.objects.filter(perfil_id=perfil_luis.perfil_id).exists()


@pytest.mark.django_db
def test_editar_testimonio(client_ana, perfil_ana):
    """Se puede editar el testimonio de un perfil existente."""
    response = client_ana.put(f'/api/perfiles/{perfil_ana.perfil_id}/', {
        'testimonio': 'Testimonio editado con más de cuarenta caracteres para el landing.',
    })
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
    perfil_ana.refresh_from_db()
    assert 'Testimonio editado' in perfil_ana.testimonio


# ── Foto de perfil (M.4) ──

@pytest.mark.django_db
def test_presigned_avatar_ok(client_ana, perfil_ana):
    """presigned-avatar devuelve upload_url, object_key, archivo_url."""
    response = client_ana.post('/api/perfiles/presigned-avatar/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
        'tamano_bytes': 1024,
    })
    assert response.status_code == status.HTTP_200_OK
    assert 'upload_url' in response.data
    assert 'object_key' in response.data
    assert 'archivo_url' in response.data
    assert response.data['object_key'].startswith('multimedia/avatars/')


@pytest.mark.django_db
def test_presigned_avatar_solo_imagenes(client_ana, perfil_ana):
    """presigned-avatar rechaza archivos que no son imagen."""
    response = client_ana.post('/api/perfiles/presigned-avatar/', {
        'nombre': 'doc.pdf',
        'content_type': 'application/pdf',
        'tamano_bytes': 1024,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    error_lower = response.data['error'].lower()
    assert 'imagen' in error_lower or 'imágen' in error_lower


@pytest.mark.django_db
def test_set_avatar_ok(client_ana, perfil_ana):
    """set-avatar guarda el object_key en foto."""
    object_key = 'multimedia/avatars/2026/10/test.jpg'
    response = client_ana.post(f'/api/perfiles/{perfil_ana.perfil_id}/set-avatar/', {
        'object_key': object_key,
    })
    assert response.status_code == status.HTTP_200_OK
    perfil_ana.refresh_from_db()
    assert perfil_ana.foto == object_key


@pytest.mark.django_db
def test_set_avatar_object_key_invalido(client_ana, perfil_ana):
    """set-avatar rechaza object_key que no empieza por multimedia/avatars/."""
    response = client_ana.post(f'/api/perfiles/{perfil_ana.perfil_id}/set-avatar/', {
        'object_key': 'otro/sitio/test.jpg',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_set_avatar_ajeno(client_ana, perfil_luis):
    """No puedo cambiar la foto de otro perfil."""
    response = client_ana.post(f'/api/perfiles/{perfil_luis.perfil_id}/set-avatar/', {
        'object_key': 'multimedia/avatars/2026/10/test.jpg',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_delete_avatar_ok(client_ana, perfil_ana):
    """delete-avatar borra la foto (pone None)."""
    perfil_ana.foto = 'multimedia/avatars/2026/10/test.jpg'
    perfil_ana.save()
    response = client_ana.delete(f'/api/perfiles/{perfil_ana.perfil_id}/avatar/')
    assert response.status_code == status.HTTP_200_OK
    perfil_ana.refresh_from_db()
    assert not perfil_ana.foto


@pytest.mark.django_db
def test_perfil_serializer_incluye_foto_url(client_ana, perfil_ana):
    """PerfilSerializer incluye foto_url."""
    perfil_ana.foto = 'multimedia/avatars/2026/10/test.jpg'
    perfil_ana.save()
    response = client_ana.get(f'/api/perfiles/{perfil_ana.perfil_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert 'foto_url' in response.data