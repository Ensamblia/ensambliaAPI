import pytest
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import RefreshToken

from config.asgi import application
from apps.usuarios.models import Usuario
from apps.perfiles.models import Perfil, PerfilChat
from apps.chats.models import Chat


async def get_token(usuario):
    """Genera un token JWT para un usuario."""
    refresh = RefreshToken.for_user(usuario)
    return str(refresh.access_token)


async def crear_usuario_y_perfil(nickname):
    """Crea un usuario con su perfil y devuelve ambos."""
    usuario = await database_sync_to_async(Usuario.objects.create_user)(
        nickname=nickname, password='pass123'
    )
    perfil = await database_sync_to_async(Perfil.objects.create)(
        nombre=nickname, apellido='Test', correo=f'{nickname}@test.com',
        descripcion='Test', usuario=usuario, tipo='usuario',
    )
    return usuario, perfil


# ==============================================================
# TESTS QUE NO CREAN USUARIOS
# ==============================================================

@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_ws_conectar_sin_token():
    """Sin token el WebSocket se rechaza."""
    communicator = WebsocketCommunicator(application, '/ws/chat/1/')
    connected, _ = await communicator.connect()
    assert connected is False
    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_ws_conectar_con_token_invalido():
    """Token inválido rechaza la conexión."""
    communicator = WebsocketCommunicator(application, '/ws/chat/1/?token=invalido')
    connected, _ = await communicator.connect()
    assert connected is False
    await communicator.disconnect()


# ==============================================================
# TESTS QUE CREAN USUARIOS (nickname único por test)
# ==============================================================

@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_ws_conectar_sin_perfil():
    """Usuario sin perfil no puede conectar."""
    usuario = await database_sync_to_async(Usuario.objects.create_user)(
        nickname='ws_sin_perfil', password='pass123'
    )
    chat = await database_sync_to_async(Chat.objects.create)()
    token = await get_token(usuario)

    communicator = WebsocketCommunicator(application, f'/ws/chat/{chat.chat_id}/?token={token}')
    connected, _ = await communicator.connect()
    assert connected is False
    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_ws_conectar_sin_participar():
    """Usuario autenticado pero sin participación en el chat → rechazado."""
    usuario, perfil = await crear_usuario_y_perfil('ws_sin_part')
    chat = await database_sync_to_async(Chat.objects.create)()
    token = await get_token(usuario)

    communicator = WebsocketCommunicator(application, f'/ws/chat/{chat.chat_id}/?token={token}')
    connected, _ = await communicator.connect()
    assert connected is False
    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_ws_conectar_ok():
    """Usuario con perfil y participante → conecta."""
    usuario, perfil = await crear_usuario_y_perfil('ws_ok')
    chat = await database_sync_to_async(Chat.objects.create)()
    await database_sync_to_async(PerfilChat.objects.create)(
        perfil=perfil, chat=chat
    )
    token = await get_token(usuario)

    communicator = WebsocketCommunicator(application, f'/ws/chat/{chat.chat_id}/?token={token}')
    connected, _ = await communicator.connect()
    assert connected is True

    # Al conectarse, debe recibir un snapshot de presencia
    response = await communicator.receive_json_from()
    assert response['tipo'] == 'presence_snapshot'

    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_ws_enviar_mensaje():
    """Enviar un mensaje por WS lo emite al grupo."""
    usuario, perfil = await crear_usuario_y_perfil('ws_msg')
    chat = await database_sync_to_async(Chat.objects.create)()
    await database_sync_to_async(PerfilChat.objects.create)(
        perfil=perfil, chat=chat
    )
    token = await get_token(usuario)

    communicator = WebsocketCommunicator(application, f'/ws/chat/{chat.chat_id}/?token={token}')
    connected, _ = await communicator.connect()
    assert connected is True

    # Consumir el snapshot de presencia
    await communicator.receive_json_from()

    # Enviar mensaje
    await communicator.send_json_to({
        'tipo': 'mensaje',
        'contenido': 'Hola por WebSocket',
    })

    # El mensaje se difunde al grupo → lo recibimos
    response = await communicator.receive_json_from()
    assert response['tipo'] == 'mensaje'
    assert response['contenido'] == 'Hola por WebSocket'
    assert response['perfil_id'] == perfil.perfil_id

    await communicator.disconnect()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_ws_typing():
    """El evento typing se emite al grupo."""
    usuario, perfil = await crear_usuario_y_perfil('ws_typing')
    chat = await database_sync_to_async(Chat.objects.create)()
    await database_sync_to_async(PerfilChat.objects.create)(
        perfil=perfil, chat=chat
    )
    token = await get_token(usuario)

    communicator = WebsocketCommunicator(application, f'/ws/chat/{chat.chat_id}/?token={token}')
    await communicator.connect()
    await communicator.receive_json_from()  # snapshot

    await communicator.send_json_to({'tipo': 'typing'})
    # El propio emisor NO recibe su propio typing.

    await communicator.disconnect()