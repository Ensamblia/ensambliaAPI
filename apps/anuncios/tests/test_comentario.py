import pytest
from rest_framework import status
from apps.anuncios.models import Comentario


# ==============================================================
# LISTAR / LEER
# ==============================================================

@pytest.mark.django_db
def test_listar_comentarios_publico(api_client, anuncio_ana, perfil_luis):
    """Cualquiera puede listar comentarios."""
    Comentario.objects.create(
        contenido='Muy bueno!', anuncio=anuncio_ana, perfil=perfil_luis,
    )
    response = api_client.get('/api/comentarios/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_comentarios_por_anuncio(api_client, anuncio_ana, perfil_luis):
    """GET /api/comentarios/anuncio/?anuncio_id=X devuelve los comentarios."""
    Comentario.objects.create(
        contenido='Muy bueno!', anuncio=anuncio_ana, perfil=perfil_luis,
    )
    response = api_client.get(f'/api/comentarios/anuncio/?anuncio_id={anuncio_ana.anuncio_id}')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1


# ==============================================================
# CREAR
# ==============================================================

@pytest.mark.django_db
def test_crear_comentario_ok(client_luis, anuncio_ana, perfil_luis):
    """Luis comenta el anuncio de Ana."""
    response = client_luis.post('/api/comentarios/', {
        'contenido': 'Muy interesante!',
        'anuncio_id': anuncio_ana.anuncio_id,
    })
    print("\n>>> STATUS:", response.status_code)
    print(">>> DATA:", response.data)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['perfil_id'] == perfil_luis.perfil_id
    assert response.data['anuncio_id'] == anuncio_ana.anuncio_id


@pytest.mark.django_db
def test_crear_comentario_sin_auth(api_client, anuncio_ana):
    """Sin token no se puede comentar."""
    response = api_client.post('/api/comentarios/', {
        'contenido': 'Muy interesante!',
        'anuncio_id': anuncio_ana.anuncio_id,
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_crear_comentario_sin_perfil(client_sin_perfil, anuncio_ana):
    """Sin perfil no se puede comentar."""
    response = client_sin_perfil.post('/api/comentarios/', {
        'contenido': 'Test comentario',
        'anuncio_id': anuncio_ana.anuncio_id,
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================================================
# EDITAR (PROPIEDAD)
# ==============================================================

@pytest.mark.django_db
def test_editar_mi_comentario(client_luis, anuncio_ana, perfil_luis):
    """Puedo editar mi propio comentario."""
    comentario = Comentario.objects.create(
        contenido='Original', anuncio=anuncio_ana, perfil=perfil_luis,
    )
    response = client_luis.put(f'/api/comentarios/{comentario.comentario_id}/', {
        'contenido': 'Editado',
    })
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
    comentario.refresh_from_db()
    assert comentario.contenido == 'Editado'


@pytest.mark.django_db
def test_no_editar_comentario_ajeno(client_ana, anuncio_ana, perfil_luis):
    """No puedo editar el comentario de otro."""
    comentario = Comentario.objects.create(
        contenido='De Luis', anuncio=anuncio_ana, perfil=perfil_luis,
    )
    response = client_ana.put(f'/api/comentarios/{comentario.comentario_id}/', {
        'contenido': 'Hackeado',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================================================
# BORRAR (PROPIEDAD)
# ==============================================================

@pytest.mark.django_db
def test_borrar_mi_comentario(client_luis, anuncio_ana, perfil_luis):
    """Puedo borrar mi propio comentario."""
    comentario = Comentario.objects.create(
        contenido='De Luis', anuncio=anuncio_ana, perfil=perfil_luis,
    )
    response = client_luis.delete(f'/api/comentarios/{comentario.comentario_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not Comentario.objects.filter(comentario_id=comentario.comentario_id).exists()


@pytest.mark.django_db
def test_no_borrar_comentario_ajeno(client_ana, anuncio_ana, perfil_luis):
    """No puedo borrar el comentario de otro."""
    comentario = Comentario.objects.create(
        contenido='De Luis', anuncio=anuncio_ana, perfil=perfil_luis,
    )
    response = client_ana.delete(f'/api/comentarios/{comentario.comentario_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Comentario.objects.filter(comentario_id=comentario.comentario_id).exists()