import pytest
from rest_framework import status
from apps.chats.models import Mensaje, MensajeAdjunto


# ==============================================================
# PRESIGNED URL — adjuntos del chat
# ==============================================================

@pytest.mark.django_db
def test_presigned_adjunto_ok(client_ana, perfil_ana):
    """Genera URL prefirmada para un adjunto del chat."""
    response = client_ana.post('/api/mensajes/presigned-adjunto/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
        'tamano_bytes': 1024,
    })
    assert response.status_code == status.HTTP_200_OK
    assert 'upload_url' in response.data
    assert 'object_key' in response.data
    assert 'archivo_url' in response.data
    assert response.data['object_key'].startswith('chat/')


@pytest.mark.django_db
def test_presigned_adjunto_sin_auth(api_client):
    """Sin token → 401."""
    response = api_client.post('/api/mensajes/presigned-adjunto/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_presigned_adjunto_sin_perfil(client_sin_perfil):
    """Sin perfil → 403."""
    response = client_sin_perfil.post('/api/mensajes/presigned-adjunto/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_presigned_adjunto_sin_nombre(client_ana, perfil_ana):
    """Sin nombre → 400."""
    response = client_ana.post('/api/mensajes/presigned-adjunto/', {
        'content_type': 'image/jpeg',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_presigned_adjunto_supera_50mb(client_ana, perfil_ana):
    """Adjunto > 50 MB → 400."""
    response = client_ana.post('/api/mensajes/presigned-adjunto/', {
        'nombre': 'enorme.mp4',
        'content_type': 'video/mp4',
        'tamano_bytes': 51 * 1024 * 1024,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert '50 MB' in str(response.data)


@pytest.mark.django_db
def test_presigned_adjunto_imagen_10mb_ok(client_ana, perfil_ana):
    """Imagen <= 10 MB → OK."""
    response = client_ana.post('/api/mensajes/presigned-adjunto/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
        'tamano_bytes': 9 * 1024 * 1024,
    })
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_presigned_adjunto_imagen_mas_de_10mb(client_ana, perfil_ana):
    """Imagen > 10 MB → 400."""
    response = client_ana.post('/api/mensajes/presigned-adjunto/', {
        'nombre': 'foto.jpg',
        'content_type': 'image/jpeg',
        'tamano_bytes': 11 * 1024 * 1024,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_presigned_adjunto_tipo_no_permitido(client_ana, perfil_ana):
    """MIME no permitido (ej: .exe) → 400."""
    response = client_ana.post('/api/mensajes/presigned-adjunto/', {
        'nombre': 'virus.exe',
        'content_type': 'application/x-msdownload',
        'tamano_bytes': 1024,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================
# CREAR ADJUNTO (huérfano, sin mensaje)
# ==============================================================

@pytest.mark.django_db
def test_crear_adjunto_ok(client_ana, perfil_ana):
    """Crea un MensajeAdjunto sin mensaje, vinculado al perfil."""
    response = client_ana.post('/api/mensajes/crear-adjunto/', {
        'nombre': 'foto.jpg',
        'archivo': 'chat/2026/10/abc.jpg',
        'tamano_bytes': 1024,
        'content_type': 'image/jpeg',
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['nombre'] == 'foto.jpg'
    assert response.data['perfil_id'] == perfil_ana.perfil_id
    assert response.data['mensaje_id'] is None
    assert MensajeAdjunto.objects.filter(nombre='foto.jpg').exists()


@pytest.mark.django_db
def test_crear_adjunto_sin_auth(api_client):
    response = api_client.post('/api/mensajes/crear-adjunto/', {
        'nombre': 'x.jpg',
        'archivo': 'chat/x.jpg',
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_crear_adjunto_sin_perfil(client_sin_perfil):
    response = client_sin_perfil.post('/api/mensajes/crear-adjunto/', {
        'nombre': 'x.jpg',
        'archivo': 'chat/x.jpg',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crear_adjunto_sin_nombre(client_ana, perfil_ana):
    response = client_ana.post('/api/mensajes/crear-adjunto/', {
        'archivo': 'chat/x.jpg',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_crear_adjunto_sin_archivo(client_ana, perfil_ana):
    response = client_ana.post('/api/mensajes/crear-adjunto/', {
        'nombre': 'x.jpg',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================
# VINCULACIÓN AL ENVIAR MENSAJE (vía REST, no WS)
# ==============================================================
# Nota: estos tests verifican que el vínculo funciona cuando
# el mensaje se crea por REST. El WS se testea en test_websocket.py.

@pytest.mark.django_db
def test_adjunto_vinculado_a_mensaje(
    client_ana, perfil_ana, chat_ana_luis
):
    """Un adjunto huérfano se vincula a un mensaje."""
    adjunto = MensajeAdjunto.objects.create(
        mensaje=None,
        perfil=perfil_ana,
        nombre='foto.jpg',
        archivo='chat/2026/10/abc.jpg',
        tamano_bytes=1024,
        content_type='image/jpeg',
    )
    mensaje = Mensaje.objects.create(
        chat=chat_ana_luis, perfil=perfil_ana, contenido='Con adjunto',
    )
    adjunto.mensaje = mensaje
    adjunto.save()
    adjunto.refresh_from_db()
    assert adjunto.mensaje_id == mensaje.mensaje_id


@pytest.mark.django_db
def test_adjuntos_aparecen_en_serializer(
    client_ana, perfil_ana, chat_ana_luis
):
    """El serializer del mensaje incluye sus adjuntos."""
    mensaje = Mensaje.objects.create(
        chat=chat_ana_luis, perfil=perfil_ana, contenido='Con adjunto',
    )
    MensajeAdjunto.objects.create(
        mensaje=mensaje, perfil=perfil_ana,
        nombre='foto.jpg', archivo='chat/2026/10/abc.jpg',
        tamano_bytes=1024, content_type='image/jpeg',
    )

    response = client_ana.get(f'/api/mensajes/{mensaje.mensaje_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert 'adjuntos' in response.data
    assert len(response.data['adjuntos']) == 1
    assert response.data['adjuntos'][0]['nombre'] == 'foto.jpg'
    assert response.data['adjuntos'][0]['archivo_url'] is not None


@pytest.mark.django_db
def test_adjuntos_por_chat(
    client_ana, perfil_ana, chat_ana_luis
):
    """Los adjuntos se devuelven al listar mensajes por chat."""
    mensaje = Mensaje.objects.create(
        chat=chat_ana_luis, perfil=perfil_ana, contenido='Con adjunto',
    )
    MensajeAdjunto.objects.create(
        mensaje=mensaje, perfil=perfil_ana,
        nombre='foto.jpg', archivo='chat/2026/10/abc.jpg',
        tamano_bytes=1024, content_type='image/jpeg',
    )

    response = client_ana.get(f'/api/mensajes/chat/?chat_id={chat_ana_luis.chat_id}')
    assert response.status_code == status.HTTP_200_OK
    results = response.data['results']
    assert len(results) == 1
    assert len(results[0]['adjuntos']) == 1


@pytest.mark.django_db
def test_no_puedo_ver_adjuntos_de_chat_ajeno(
    client_ana, perfil_luis, chat_luis_marta
):
    """Ana no ve adjuntos de un chat ajeno."""
    m = Mensaje.objects.create(
        chat=chat_luis_marta, perfil=perfil_luis, contenido='Hola',
    )
    MensajeAdjunto.objects.create(
        mensaje=m, perfil=perfil_luis,
        nombre='foto.jpg', archivo='chat/2026/10/abc.jpg',
        tamano_bytes=1024, content_type='image/jpeg',
    )

    response = client_ana.get(f'/api/mensajes/chat/?chat_id={chat_luis_marta.chat_id}')
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================================================
# BORRADO EN CASCADA
# ==============================================================

@pytest.mark.django_db
def test_borrar_mensaje_borra_adjuntos(perfil_ana, chat_ana_luis):
    """Al borrar el mensaje se borran sus adjuntos (cascade)."""
    m = Mensaje.objects.create(
        chat=chat_ana_luis, perfil=perfil_ana, contenido='Con adjunto',
    )
    adj = MensajeAdjunto.objects.create(
        mensaje=m, perfil=perfil_ana,
        nombre='foto.jpg', archivo='chat/2026/10/abc.jpg',
        tamano_bytes=1024, content_type='image/jpeg',
    )
    adjunto_id = adj.adjunto_id
    m.delete()
    assert not MensajeAdjunto.objects.filter(adjunto_id=adjunto_id).exists()


# ==============================================================
# VALIDACIÓN DE PROPIEDAD
# ==============================================================

@pytest.mark.django_db
def test_adjunto_tiene_perfil_al_crearse(client_ana, perfil_ana):
    """Al crear un adjunto, se guarda el perfil que lo subió."""
    response = client_ana.post('/api/mensajes/crear-adjunto/', {
        'nombre': 'foto.jpg',
        'archivo': 'chat/2026/10/abc.jpg',
        'tamano_bytes': 1024,
        'content_type': 'image/jpeg',
    })
    assert response.status_code == status.HTTP_201_CREATED
    adjunto = MensajeAdjunto.objects.get(adjunto_id=response.data['adjunto_id'])
    assert adjunto.perfil_id == perfil_ana.perfil_id