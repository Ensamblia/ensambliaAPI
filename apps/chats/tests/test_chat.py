import pytest
from rest_framework import status
from apps.chats.models import Chat
from apps.perfiles.models import PerfilChat


# ==============================================================
# LISTAR / LEER (solo mis chats)
# ==============================================================

@pytest.mark.django_db
def test_listar_mis_chats(client_ana, chat_ana_luis, chat_luis_marta):
    """Ana solo ve el chat donde participa (Ana-Luis)."""
    response = client_ana.get('/api/chats/')
    assert response.status_code == status.HTTP_200_OK
    # Ana solo participa en 1 chat
    assert len(response.data) == 1
    assert response.data[0]['chat_id'] == chat_ana_luis.chat_id


@pytest.mark.django_db
def test_listar_chats_sin_auth(api_client):
    """Sin autenticación no se pueden listar chats."""
    response = api_client.get('/api/chats/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_obtener_mi_chat(client_ana, chat_ana_luis):
    """Ana puede ver su propio chat."""
    response = client_ana.get(f'/api/chats/{chat_ana_luis.chat_id}/')
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_no_obtener_chat_ajeno(client_ana, chat_luis_marta):
    """Ana no puede ver un chat en el que no participa."""
    response = client_ana.get(f'/api/chats/{chat_luis_marta.chat_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_obtener_chat_inexistente(client_ana):
    """Chat inexistente devuelve 403 (no participa) o 404."""
    response = client_ana.get('/api/chats/99999/')
    assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]


# ==============================================================
# INICIAR CONVERSACIÓN
# ==============================================================

@pytest.mark.django_db
def test_iniciar_conversacion_nueva(client_ana, perfil_ana, perfil_luis):
    """Ana inicia una conversación con Luis: se crea un chat."""
    response = client_ana.post(f'/api/chats/con/{perfil_luis.perfil_id}/')
    assert response.status_code == status.HTTP_201_CREATED
    assert 'chat_id' in response.data
    # El chat existe y tiene 2 participantes
    chat_id = response.data['chat_id']
    assert PerfilChat.objects.filter(chat_id=chat_id).count() == 2


@pytest.mark.django_db
def test_iniciar_conversacion_existente(client_ana, perfil_ana, perfil_luis, chat_ana_luis):
    """Si ya existe un chat, no se crea uno nuevo."""
    response = client_ana.post(f'/api/chats/con/{perfil_luis.perfil_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['chat_id'] == chat_ana_luis.chat_id


@pytest.mark.django_db
def test_iniciar_conversacion_conmigo_mismo(client_ana, perfil_ana):
    """No puedo iniciar un chat conmigo mismo."""
    response = client_ana.post(f'/api/chats/con/{perfil_ana.perfil_id}/')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_iniciar_conversacion_perfil_inexistente(client_ana, perfil_ana):
    """Iniciar chat con un perfil que no existe devuelve 404."""
    response = client_ana.post('/api/chats/con/99999/')
    assert response.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================
# BORRAR CHAT
# ==============================================================

@pytest.mark.django_db
def test_borrar_mi_chat(client_ana, chat_ana_luis):
    """Ana puede borrar un chat donde participa."""
    response = client_ana.delete(f'/api/chats/{chat_ana_luis.chat_id}/')
    assert response.status_code == status.HTTP_200_OK
    assert not Chat.objects.filter(chat_id=chat_ana_luis.chat_id).exists()


@pytest.mark.django_db
def test_no_borrar_chat_ajeno(client_ana, chat_luis_marta):
    """Ana no puede borrar un chat donde no participa."""
    response = client_ana.delete(f'/api/chats/{chat_luis_marta.chat_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Chat.objects.filter(chat_id=chat_luis_marta.chat_id).exists()


# ==============================================================
# NO LEÍDOS
# ==============================================================

@pytest.mark.django_db
def test_no_leidos_sin_mensajes(client_ana, chat_ana_luis):
    """Sin mensajes, todo está a 0."""
    response = client_ana.get('/api/chats/no-leidos/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total'] == 0
    assert response.data['por_chat'] == {}


@pytest.mark.django_db
def test_no_leidos_con_mensajes(client_ana, chat_ana_luis, perfil_luis):
    """Ana tiene 2 mensajes no leídos de Luis."""
    from apps.chats.models import Mensaje
    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Hola 1')
    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Hola 2')

    response = client_ana.get('/api/chats/no-leidos/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total'] == 2
    assert str(chat_ana_luis.chat_id) in response.data['por_chat']


@pytest.mark.django_db
def test_no_leidos_excluye_mis_mensajes(client_ana, chat_ana_luis, perfil_ana):
    """Mis propios mensajes no cuentan como no leídos."""
    from apps.chats.models import Mensaje
    Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_ana, contenido='Mío')

    response = client_ana.get('/api/chats/no-leidos/')
    assert response.data['total'] == 0


@pytest.mark.django_db
def test_no_leidos_excluye_leidos(client_ana, chat_ana_luis, perfil_luis, perfil_ana):
    """Los mensajes ya leídos no cuentan."""
    from apps.chats.models import Mensaje, MensajeLeido
    m = Mensaje.objects.create(chat=chat_ana_luis, perfil=perfil_luis, contenido='Hola')
    MensajeLeido.objects.create(mensaje=m, perfil=perfil_ana)

    response = client_ana.get('/api/chats/no-leidos/')
    assert response.data['total'] == 0