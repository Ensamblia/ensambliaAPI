import pytest
from rest_framework import status
from apps.chats.models import Mensaje


# ==============================================================
# LISTAR / LEER
# ==============================================================

@pytest.mark.django_db
def test_listar_mis_mensajes(client_ana, chat_ana_luis, perfil_ana, perfil_luis):
    """Ana solo ve los mensajes de sus chats."""
    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_ana, contenido='Hola')
    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Qué tal')

    response = client_ana.get('/api/mensajes/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_mensajes_por_chat(client_ana, chat_ana_luis, perfil_ana, perfil_luis):
    """GET /api/mensajes/chat/?chat_id=X devuelve los mensajes."""
    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_ana, contenido='Hola')
    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Qué tal')

    response = client_ana.get(f'/api/mensajes/chat/?chat_id={chat_ana_luis.chat_id}')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 2


@pytest.mark.django_db
def test_mensajes_por_chat_ajeno(client_ana, chat_luis_marta, perfil_luis, perfil_marta):
    """Ana no puede ver mensajes de un chat ajeno."""
    Mensaje.objects.create(chat=chat_luis_marta, perfil=perfil_luis, contenido='Hola')

    response = client_ana.get(f'/api/mensajes/chat/?chat_id={chat_luis_marta.chat_id}')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_mensajes_por_chat_sin_auth(api_client, chat_ana_luis):
    """Sin token no se pueden ver mensajes."""
    response = api_client.get(f'/api/mensajes/chat/?chat_id={chat_ana_luis.chat_id}')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ==============================================================
# CREAR
# ==============================================================

@pytest.mark.django_db
def test_enviar_mensaje_ok(client_ana, chat_ana_luis, perfil_ana):
    """Ana envía un mensaje al chat."""
    response = client_ana.post('/api/mensajes/', {
        'contenido': 'Hola Luis!',
        'chat_id': chat_ana_luis.chat_id,
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['contenido'] == 'Hola Luis!'
    assert response.data['perfil_id'] == perfil_ana.perfil_id


@pytest.mark.django_db
def test_enviar_mensaje_sin_auth(api_client, chat_ana_luis):
    """Sin token no se puede enviar mensaje."""
    response = api_client.post('/api/mensajes/', {
        'contenido': 'Test',
        'chat_id': chat_ana_luis.chat_id,
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_enviar_mensaje_a_chat_ajeno(client_ana, chat_luis_marta):
    """Ana no puede enviar un mensaje a un chat donde no participa."""
    response = client_ana.post('/api/mensajes/', {
        'contenido': 'Test',
        'chat_id': chat_luis_marta.chat_id,
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_enviar_mensaje_sin_contenido(client_ana, chat_ana_luis, perfil_ana):
    """Mensaje sin contenido devuelve 400."""
    response = client_ana.post('/api/mensajes/', {
        'contenido': '',
        'chat_id': chat_ana_luis.chat_id,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ==============================================================
# EDITAR (PROPIEDAD)
# ==============================================================

@pytest.mark.django_db
def test_editar_mi_mensaje(client_ana, chat_ana_luis, perfil_ana):
    """Puedo editar mi propio mensaje."""
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_ana, contenido='Original')
    response = client_ana.put(f'/api/mensajes/{m.mensaje_id}/', {
        'contenido': 'Editado',
    })
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
    m.refresh_from_db()
    assert m.contenido == 'Editado'


@pytest.mark.django_db
def test_no_editar_mensaje_ajeno(client_ana, chat_ana_luis, perfil_luis):
    """No puedo editar un mensaje que no es mío."""
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='De Luis')
    response = client_ana.put(f'/api/mensajes/{m.mensaje_id}/', {
        'contenido': 'Hackeado',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN
    m.refresh_from_db()
    assert m.contenido == 'De Luis'


# ==============================================================
# BORRAR (PROPIEDAD)
# ==============================================================

@pytest.mark.django_db
def test_borrar_mi_mensaje(client_ana, chat_ana_luis, perfil_ana):
    """Puedo borrar mi propio mensaje."""
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_ana, contenido='Mío')
    response = client_ana.delete(f'/api/mensajes/{m.mensaje_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not Mensaje.objects.filter(mensaje_id=m.mensaje_id).exists()


@pytest.mark.django_db
def test_no_borrar_mensaje_ajeno(client_ana, chat_ana_luis, perfil_luis):
    """No puedo borrar un mensaje que no es mío."""
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='De Luis')
    response = client_ana.delete(f'/api/mensajes/{m.mensaje_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Mensaje.objects.filter(mensaje_id=m.mensaje_id).exists()