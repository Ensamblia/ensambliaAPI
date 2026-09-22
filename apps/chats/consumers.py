import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket para el chat en tiempo real con presencia, edición y borrado.

    Eventos entrantes:
        { "tipo": "mensaje", "contenido": "..." }
        { "tipo": "typing" }
        { "tipo": "leido", "mensaje_id": 123 }
        { "tipo": "editar_mensaje", "mensaje_id": 123, "contenido": "nuevo" }
        { "tipo": "borrar_mensaje", "mensaje_id": 123 }

    Eventos salientes:
        { "tipo": "mensaje", ... }
        { "tipo": "typing", ... }
        { "tipo": "leido", ... }
        { "tipo": "status", ... }
        { "tipo": "presence_snapshot", ... }
        { "tipo": "mensaje_editado", "mensaje_id": ..., "contenido": ..., "esta_editado": true }
        { "tipo": "mensaje_borrado", "mensaje_id": ... }
    """

    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'
        self.presence_group_name = f'presence_{self.chat_id}'
        self.perfil_id = self.scope.get('perfil_id')

        if not self.perfil_id:
            await self.close(code=4001)
            return

        if not await self.es_participante(self.chat_id, self.perfil_id):
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add(self.presence_group_name, self.channel_name)

        await self.accept()

        online_list = await self._presence_add(self.chat_id, self.perfil_id)
        snapshot_sin_mi = [p for p in online_list if p != self.perfil_id]
        await self.send(text_data=json.dumps({
            'tipo': 'presence_snapshot',
            'perfiles_online': snapshot_sin_mi,
        }))

        await self.channel_layer.group_send(
            self.presence_group_name,
            {
                'type': 'presence_update',
                'perfil_id': self.perfil_id,
                'status': 'online',
            },
        )

    async def disconnect(self, close_code):
        if not hasattr(self, 'room_group_name'):
            return

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        if hasattr(self, 'presence_group_name'):
            await self.channel_layer.group_discard(self.presence_group_name, self.channel_name)

        if self.perfil_id:
            await self._presence_remove(self.chat_id, self.perfil_id)
            await self.channel_layer.group_send(
                self.presence_group_name,
                {
                    'type': 'presence_update',
                    'perfil_id': self.perfil_id,
                    'status': 'offline',
                },
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            return

        tipo = data.get('tipo')

        if tipo == 'mensaje':
            await self._handle_mensaje(data)

        elif tipo == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_typing',
                    'perfil_id': self.perfil_id,
                },
            )

        elif tipo == 'leido':
            mensaje_id = data.get('mensaje_id')
            if not mensaje_id:
                return
            await self._marcar_leido(mensaje_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'mensaje_leido',
                    'mensaje_id': mensaje_id,
                    'perfil_id': self.perfil_id,
                },
            )

        elif tipo == 'editar_mensaje':
            await self._handle_editar_mensaje(data)

        elif tipo == 'borrar_mensaje':
            await self._handle_borrar_mensaje(data)

    # ============================================================
    # Handlers
    # ============================================================

    async def _handle_mensaje(self, data):
        contenido = (data.get('contenido') or '').strip()
        if not contenido:
            return

        mensaje = await self.crear_mensaje(
            chat_id=self.chat_id,
            perfil_id=self.perfil_id,
            contenido=contenido,
        )
        if not mensaje:
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'mensaje': mensaje,
            },
        )

    async def _handle_editar_mensaje(self, data):
        mensaje_id = data.get('mensaje_id')
        nuevo_contenido = (data.get('contenido') or '').strip()

        if not mensaje_id or not nuevo_contenido:
            return

        ok = await self.editar_mensaje(
            mensaje_id=mensaje_id,
            perfil_id=self.perfil_id,
            nuevo_contenido=nuevo_contenido,
        )
        if not ok:
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'mensaje_editado',
                'mensaje_id': mensaje_id,
                'contenido': nuevo_contenido,
            },
        )

    async def _handle_borrar_mensaje(self, data):
        mensaje_id = data.get('mensaje_id')
        if not mensaje_id:
            return

        ok = await self.borrar_mensaje(
            mensaje_id=mensaje_id,
            perfil_id=self.perfil_id,
        )
        if not ok:
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'mensaje_borrado',
                'mensaje_id': mensaje_id,
            },
        )

    # ============================================================
    # Handlers de eventos del grupo
    # ============================================================

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'tipo': 'mensaje',
            **event['mensaje'],
        }))

    async def user_typing(self, event):
        if event['perfil_id'] == self.perfil_id:
            return
        await self.send(text_data=json.dumps({
            'tipo': 'typing',
            'perfil_id': event['perfil_id'],
        }))

    async def mensaje_leido(self, event):
        await self.send(text_data=json.dumps({
            'tipo': 'leido',
            'mensaje_id': event['mensaje_id'],
            'perfil_id': event['perfil_id'],
        }))

    async def presence_update(self, event):
        if event['perfil_id'] == self.perfil_id:
            return
        await self.send(text_data=json.dumps({
            'tipo': 'status',
            'perfil_id': event['perfil_id'],
            'status': event['status'],
        }))

    async def mensaje_editado(self, event):
        await self.send(text_data=json.dumps({
            'tipo': 'mensaje_editado',
            'mensaje_id': event['mensaje_id'],
            'contenido': event['contenido'],
        }))

    async def mensaje_borrado(self, event):
        await self.send(text_data=json.dumps({
            'tipo': 'mensaje_borrado',
            'mensaje_id': event['mensaje_id'],
        }))

    # ============================================================
    # Helpers DB + Cache
    # ============================================================

    @database_sync_to_async
    def es_participante(self, chat_id, perfil_id):
        from apps.perfiles.models import PerfilChat
        return PerfilChat.objects.filter(chat_id=chat_id, perfil_id=perfil_id).exists()

    @database_sync_to_async
    def crear_mensaje(self, chat_id, perfil_id, contenido):
        from .models import Mensaje
        try:
            m = Mensaje.objects.create(
                chat_id=chat_id,
                perfil_id=perfil_id,
                contenido=contenido,
            )
        except Exception:
            return None
        return {
            'mensaje_id': m.mensaje_id,
            'chat_id': m.chat_id,
            'perfil_id': m.perfil_id,
            'contenido': m.contenido,
            'fecha_envio': m.fecha_envio.isoformat(),
            'esta_eliminado': m.esta_eliminado,
            'leido_por': [],
        }

    @database_sync_to_async
    def editar_mensaje(self, mensaje_id, perfil_id, nuevo_contenido):
        from .models import Mensaje
        try:
            m = Mensaje.objects.get(mensaje_id=mensaje_id)
        except Mensaje.DoesNotExist:
            return False
        if m.perfil_id != perfil_id:
            return False
        m.contenido = nuevo_contenido
        m.save(update_fields=['contenido'])
        return True

    @database_sync_to_async
    def borrar_mensaje(self, mensaje_id, perfil_id):
        from .models import Mensaje
        try:
            m = Mensaje.objects.get(mensaje_id=mensaje_id)
        except Mensaje.DoesNotExist:
            return False
        if m.perfil_id != perfil_id:
            return False
        m.esta_eliminado = True
        m.save(update_fields=['esta_eliminado'])
        return True

    @database_sync_to_async
    def _marcar_leido(self, mensaje_id):
        from .models import MensajeLeido
        try:
            MensajeLeido.objects.get_or_create(
                mensaje_id=mensaje_id,
                perfil_id=self.perfil_id,
            )
        except Exception:
            pass

    @database_sync_to_async
    def _presence_add(self, chat_id, perfil_id):
        from django.core.cache import cache
        key = f'presence:chat:{chat_id}'
        online = cache.get(key, [])
        if perfil_id not in online:
            online.append(perfil_id)
            cache.set(key, online, timeout=None)
        return online

    @database_sync_to_async
    def _presence_remove(self, chat_id, perfil_id):
        from django.core.cache import cache
        key = f'presence:chat:{chat_id}'
        online = cache.get(key, [])
        if perfil_id in online:
            online.remove(perfil_id)
            cache.set(key, online, timeout=None)
        return online