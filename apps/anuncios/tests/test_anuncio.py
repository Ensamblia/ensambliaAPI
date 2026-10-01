import pytest
from rest_framework import status
from apps.anuncios.models import Anuncio


# ==============================================================
# LISTAR / LEER (público)
# ==============================================================

@pytest.mark.django_db
def test_listar_anuncios_publico(api_client, anuncio_ana, anuncio_luis):
    """Cualquiera puede listar anuncios."""
    response = api_client.get('/api/anuncios/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] >= 2


@pytest.mark.django_db
def test_listar_anuncios_vacio(api_client):
    """Sin anuncios devuelve lista vacía."""
    response = api_client.get('/api/anuncios/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 0


@pytest.mark.django_db
def test_obtener_anuncio_por_id(api_client, anuncio_ana):
    """Obtener un anuncio por ID es público."""
    response = api_client.get(f'/api/anuncios/{anuncio_ana.anuncio_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['titulo'] == 'Busco bateria'


@pytest.mark.django_db
def test_obtener_anuncio_inexistente(api_client):
    """Anuncio inexistente devuelve 404."""
    response = api_client.get('/api/anuncios/99999/')
    assert response.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================
# CREAR
# ==============================================================

@pytest.mark.django_db
def test_crear_anuncio_ok(client_ana, perfil_ana, tipo_anuncio):
    """Ana crea un anuncio y se le asigna su perfil automáticamente."""
    response = client_ana.post('/api/anuncios/', {
        'titulo': 'Busco pianista',
        'contenido': 'Para grupo de jazz en Madrid',
        'tipo_anuncio_id': tipo_anuncio.tipo_anuncio_id,
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['titulo'] == 'Busco pianista'
    assert response.data['perfil_id'] == perfil_ana.perfil_id


@pytest.mark.django_db
def test_crear_anuncio_sin_auth(api_client):
    """Sin token no se puede crear anuncio."""
    response = api_client.post('/api/anuncios/', {
        'titulo': 'Test',
        'contenido': 'Test test test',
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_crear_anuncio_sin_perfil(client_ana, tipo_anuncio):
    """Sin perfil no se puede crear anuncio."""
    response = client_ana.post('/api/anuncios/', {
        'titulo': 'Busco pianista',
        'contenido': 'Para grupo de jazz en Madrid',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_anuncio_no_puede_falsificar_perfil(client_luis, perfil_luis, perfil_ana, tipo_anuncio):
    """Aunque el front mande otro perfil_id, se asigna el mío."""
    response = client_luis.post('/api/anuncios/', {
        'titulo': 'Test',
        'contenido': 'Contenido del test',
        'perfil_id': perfil_ana.perfil_id,  # ← intenta falsificar
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['perfil_id'] == perfil_luis.perfil_id


@pytest.mark.django_db
def test_crear_anuncio_titulo_corto(client_ana, perfil_ana):
    """Título muy corto devuelve 400."""
    response = client_ana.post('/api/anuncios/', {
        'titulo': 'Ab',
        'contenido': 'Contenido del test',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_crear_anuncio_sin_titulo(client_ana, perfil_ana):
    """Sin título devuelve 400."""
    response = client_ana.post('/api/anuncios/', {
        'contenido': 'Contenido sin titulo',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================
# EDITAR (PROPIEDAD)
# ==============================================================

@pytest.mark.django_db
def test_editar_mi_anuncio(client_ana, anuncio_ana):
    """Puedo editar mi propio anuncio."""
    response = client_ana.put(f'/api/anuncios/{anuncio_ana.anuncio_id}/', {
        'titulo': 'Busco bateria URGENTE',
        'contenido': 'Actualizado el contenido del anuncio.',
    })
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
    anuncio_ana.refresh_from_db()
    assert anuncio_ana.titulo == 'Busco bateria URGENTE'


@pytest.mark.django_db
def test_no_editar_anuncio_ajeno(client_luis, anuncio_ana):
    """No puedo editar el anuncio de otro usuario."""
    response = client_luis.put(f'/api/anuncios/{anuncio_ana.anuncio_id}/', {
        'titulo': 'Hackeado',
        'contenido': 'JAJA',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN
    anuncio_ana.refresh_from_db()
    assert anuncio_ana.titulo == 'Busco bateria'


@pytest.mark.django_db
def test_admin_puede_editar_anuncio_ajeno(client_admin, anuncio_ana):
    """Un admin SÍ puede editar el anuncio de otro."""
    response = client_admin.put(f'/api/anuncios/{anuncio_ana.anuncio_id}/', {
        'titulo': 'Editado por admin',
        'contenido': 'Contenido editado por el admin',
    })
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]


# ==============================================================
# BORRAR (PROPIEDAD)
# ==============================================================

@pytest.mark.django_db
def test_borrar_mi_anuncio(client_ana, anuncio_ana):
    """Puedo borrar mi propio anuncio."""
    response = client_ana.delete(f'/api/anuncios/{anuncio_ana.anuncio_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not Anuncio.objects.filter(anuncio_id=anuncio_ana.anuncio_id).exists()


@pytest.mark.django_db
def test_no_borrar_anuncio_ajeno(client_luis, anuncio_ana):
    """No puedo borrar el anuncio de otro usuario."""
    response = client_luis.delete(f'/api/anuncios/{anuncio_ana.anuncio_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Anuncio.objects.filter(anuncio_id=anuncio_ana.anuncio_id).exists()


@pytest.mark.django_db
def test_admin_puede_borrar_anuncio_ajeno(client_admin, anuncio_ana):
    """Un admin SÍ puede borrar el anuncio de otro."""
    response = client_admin.delete(f'/api/anuncios/{anuncio_ana.anuncio_id}/')
    assert response.status_code == status.HTTP_200_OK