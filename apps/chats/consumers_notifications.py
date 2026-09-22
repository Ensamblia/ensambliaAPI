import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket global de notificaciones por usuario.

    URL: ws://localhost:8000/ws/notifications/?token=<JWT>

    Al conectarse, se une a un grupo por perfil_id (`user_<perfil_id>`).
    Recibe eventos cuando:
    - Alguien te envía un mensaje en cualquier chat del que participes.

    Eventos salientes:
        { "tipo": "nuevo_mensaje", "chat_id": ..., "mensaje_id": ..., "contenido": ..., "perfil_id": ... }
    """

    async def connect(self):
        self.perfil_id = self.scope.get('perfil_id')

        if not self.perfil_id:
            await self.close(code=4001)
            return

        self.user_group_name = f'user_{self.perfil_id}'

        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def nuevo_mensaje(self, event):
        """Reenvía el evento al cliente WebSocket."""
        await self.send(text_data=json.dumps({
            'tipo': 'nuevo_mensaje',
            'chat_id': event['chat_id'],
            'mensaje_id': event['mensaje_id'],
            'contenido': event['contenido'],
            'perfil_id': event['perfil_id'],
            'fecha_envio': event['fecha_envio'],
        }))