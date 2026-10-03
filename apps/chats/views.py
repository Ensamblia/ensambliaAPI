from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.usuarios.mixins_pagination import PaginationMixin
from apps.usuarios.mixins import MiPerfilMixin
from apps.perfiles.models import PerfilChat, Perfil
from .models import Chat, Mensaje, MensajeLeido, MensajeAdjunto
from .serializers import (
    ChatSerializer, MensajeSerializer, MensajeCreateSerializer,
    MensajeUpdateSerializer, MensajeLeidoSerializer, MensajeAdjuntoSerializer,
)
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.usuarios.pagination import StandardLimitOffsetPagination
from rest_framework.decorators import action
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from .utils import validar_archivo


def _es_participante(chat_id, perfil_id):
    return PerfilChat.objects.filter(chat_id=chat_id, perfil_id=perfil_id).exists()


# ==================================================================
# CHAT
# ==================================================================
class ChatViewSet(viewsets.ViewSet, MiPerfilMixin):
    """
    - GET    /api/chats                       → solo mis chats
    - GET    /api/chats/:id                   → detalle (si participo)
    - POST   /api/chats/con/:otro_perfil_id   → iniciar/buscar chat 1-a-1
    - DELETE /api/chats/:id                   → borrar (si participo)
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response([], status=status.HTTP_200_OK)

        mis_chat_ids = PerfilChat.objects.filter(perfil_id=mi_perfil_id).values_list('chat_id', flat=True)
        qs = Chat.objects.filter(chat_id__in=list(mis_chat_ids))
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(ChatSerializer(qs, many=True).data)

    def no_leidos(self, request):
        """
        GET /api/chats/no-leidos
        Devuelve el conteo de mensajes no leídos por chat + total.
        """
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response({'total': 0, 'por_chat': {}}, status=status.HTTP_200_OK)

        mis_chat_ids = list(
            PerfilChat.objects.filter(perfil_id=mi_perfil_id).values_list('chat_id', flat=True)
        )

        leidos_ids = MensajeLeido.objects.filter(
            perfil_id=mi_perfil_id
        ).values_list('mensaje_id', flat=True)

        no_leidos_qs = Mensaje.objects.filter(
            chat_id__in=mis_chat_ids,
        ).exclude(
            perfil_id=mi_perfil_id,
        ).exclude(
            mensaje_id__in=leidos_ids,
        ).values('chat_id').annotate(total=Count('mensaje_id'))

        por_chat = {str(row['chat_id']): row['total'] for row in no_leidos_qs}
        total = sum(por_chat.values())

        return Response({'total': total, 'por_chat': por_chat})

    def retrieve(self, request, pk=None):
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id or not _es_participante(pk, mi_perfil_id):
            return Response({'error': 'No participas en este chat'}, status=status.HTTP_403_FORBIDDEN)

        try:
            chat = Chat.objects.get(pk=pk)
        except Chat.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ChatSerializer(chat).data)

    def iniciar_conversacion(self, request, otro_perfil_id=None):
        """POST /api/chats/con/:otro_perfil_id"""
        try:
            otro_perfil_id = int(otro_perfil_id)
        except (TypeError, ValueError):
            return Response({'error': 'otro_perfil_id debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response(
                {'error': 'Necesitas crear tu perfil antes de iniciar una conversación'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if otro_perfil_id == mi_perfil_id:
            return Response({'error': 'No puedes iniciar un chat contigo mismo'}, status=status.HTTP_400_BAD_REQUEST)

        if not Perfil.objects.filter(pk=otro_perfil_id).exists():
            return Response(
                {'error': f'Perfil no encontrado: {otro_perfil_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )

        mis_chat_ids = PerfilChat.objects.filter(perfil_id=mi_perfil_id).values_list('chat_id', flat=True)
        for chat_id in mis_chat_ids:
            participantes = list(PerfilChat.objects.filter(chat_id=chat_id).values_list('perfil_id', flat=True))
            if len(participantes) == 2 and otro_perfil_id in participantes:
                return Response({'chat_id': chat_id}, status=status.HTTP_200_OK)

        chat = Chat.objects.create()
        PerfilChat.objects.create(perfil_id=mi_perfil_id, chat_id=chat.chat_id)
        PerfilChat.objects.create(perfil_id=otro_perfil_id, chat_id=chat.chat_id)
        return Response({'chat_id': chat.chat_id}, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id or not _es_participante(pk, mi_perfil_id):
            return Response({'error': 'No participas en este chat'}, status=status.HTTP_403_FORBIDDEN)

        try:
            chat = Chat.objects.get(pk=pk)
        except Chat.DoesNotExist:
            return Response({'error': 'Chat not found'}, status=status.HTTP_404_NOT_FOUND)

        data = ChatSerializer(chat).data
        chat.delete()
        return Response(data, status=status.HTTP_200_OK)


# ==================================================================
# MENSAJE
# ==================================================================
class MensajeViewSet(PaginationMixin, viewsets.ViewSet, MiPerfilMixin):
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['contenido']
    ordering_fields = ['fecha_envio', 'mensaje_id']
    ordering = ['fecha_envio']

    def _mis_mensajes(self, mi_perfil_id):
        mis_chat_ids = PerfilChat.objects.filter(perfil_id=mi_perfil_id).values_list('chat_id', flat=True)
        return Mensaje.objects.filter(chat_id__in=list(mis_chat_ids))

    def _aplicar_filtros(self, queryset):
        for backend in self.filter_backends:
            queryset = backend().filter_queryset(self.request, queryset, self)
        return queryset

    def list(self, request):
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response([], status=status.HTTP_200_OK)

        queryset = self._mis_mensajes(mi_perfil_id)
        queryset = self._aplicar_filtros(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = MensajeSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = MensajeSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def by_chat(self, request):
        """
        GET /api/mensajes/chat?chat_id=X&limit=30&before_id=Y
        """
        chat_id = request.query_params.get('chat_id')
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id or not _es_participante(chat_id, mi_perfil_id):
            return Response({'error': 'No participas en este chat'}, status=status.HTTP_403_FORBIDDEN)

        try:
            limit = int(request.query_params.get('limit', 30))
            limit = max(1, min(limit, 100))
        except (ValueError, TypeError):
            limit = 30

        before_id = request.query_params.get('before_id')

        qs = Mensaje.objects.filter(chat_id=chat_id)

        if before_id:
            try:
                before_id_int = int(before_id)
                qs = qs.filter(mensaje_id__lt=before_id_int)
            except (ValueError, TypeError):
                pass

        qs = qs.order_by('-mensaje_id')[:limit]
        mensajes = list(reversed(list(qs)))

        if not mensajes:
            return Response([], status=status.HTTP_200_OK)

        mas_antiguos = Mensaje.objects.filter(
            chat_id=chat_id,
            mensaje_id__lt=mensajes[0].mensaje_id,
        ).exists()

        return Response({
            'results': MensajeSerializer(mensajes, many=True, context={'request': request}).data,
            'has_more': mas_antiguos,
        })

    def by_perfil(self, request):
        perfil_id = request.query_params.get('perfil_id')
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id or int(perfil_id) != mi_perfil_id:
            return Response({'error': 'No puedes ver los mensajes de otro perfil'}, status=status.HTTP_403_FORBIDDEN)
        qs = Mensaje.objects.filter(perfil_id=perfil_id).order_by('-fecha_envio')
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(MensajeSerializer(qs, many=True, context={'request': request}).data)

    def retrieve(self, request, pk=None):
        try:
            obj = Mensaje.objects.get(pk=pk)
        except Mensaje.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )

        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id or not _es_participante(obj.chat_id, mi_perfil_id):
            return Response({'error': 'No participas en el chat de este mensaje'}, status=status.HTTP_403_FORBIDDEN)

        return Response(MensajeSerializer(obj, context={'request': request}).data)

    def create(self, request):
        contenido = request.data.get('contenido')
        if not contenido or not str(contenido).strip():
            return Response(
                {'error': 'contenido is a mandatory field. Cannot be undefined or null'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        chat_id = request.data.get('chat_id')
        perfil_id = self.get_mi_perfil_id(request)
        if not perfil_id:
            return Response(
                {'error': 'Necesitas crear tu perfil antes de enviar mensajes'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not _es_participante(chat_id, perfil_id):
            return Response({'error': 'No participas en este chat'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MensajeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mensaje = serializer.save(perfil_id=perfil_id)
        return Response(
            MensajeSerializer(mensaje, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, pk=None):
        try:
            obj = Mensaje.objects.get(pk=pk)
        except Mensaje.DoesNotExist:
            return Response({'error': 'mensaje not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if obj.perfil_id != mi_perfil_id:
            return Response({'error': 'No puedes editar un mensaje que no es tuyo'}, status=status.HTTP_403_FORBIDDEN)

        serializer = MensajeUpdateSerializer(obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(MensajeSerializer(obj, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        try:
            obj = Mensaje.objects.get(pk=pk)
        except Mensaje.DoesNotExist:
            return Response({'error': 'Mensaje not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if obj.perfil_id != mi_perfil_id:
            return Response({'error': 'No puedes borrar un mensaje que no es tuyo'}, status=status.HTTP_403_FORBIDDEN)

        data = MensajeSerializer(obj, context={'request': request}).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)

    # ============================================================
    # ADJUNTOS DEL CHAT
    # ============================================================
    @action(detail=False, methods=['post'], url_path='presigned-adjunto')
    def presigned_adjunto(self, request):
        """
        POST /api/mensajes/presigned-adjunto/
        Body: { nombre, content_type, tamano_bytes? }
        """
        import uuid
        import boto3
        from datetime import datetime
        from botocore.client import Config
        from django.conf import settings
        from .utils import validar_archivo

        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response(
                {'error': 'Necesitas un perfil para subir archivos'},
                status=status.HTTP_403_FORBIDDEN,
            )

        nombre = request.data.get('nombre')
        content_type = request.data.get('content_type', 'application/octet-stream')
        tamano_bytes = request.data.get('tamano_bytes')

        if not nombre:
            return Response({'error': 'nombre es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        # Validación unificada (MIME + límite por tipo)
        ok, resultado = validar_archivo(nombre, content_type, tamano_bytes)
        if not ok:
            return Response({'error': resultado}, status=status.HTTP_400_BAD_REQUEST)
        content_type = resultado  # content_type normalizado

        extension = nombre.rsplit('.', 1)[-1] if '.' in nombre else 'bin'
        now = datetime.now()
        object_key = f'chat/{now.year}/{now.month:02d}/{uuid.uuid4()}.{extension}'

        s3_client = boto3.client(
            's3',
            endpoint_url=settings.MINIO_ENDPOINT,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1',
        )

        try:
            upload_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': settings.MINIO_BUCKET_NAME,
                    'Key': object_key,
                    'ContentType': content_type,
                },
                ExpiresIn=3600,
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        archivo_url = f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET_NAME}/{object_key}"

        return Response({
            'upload_url': upload_url,
            'object_key': object_key,
            'archivo_url': archivo_url,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='crear-adjunto')
    def crear_adjunto(self, request):
        """
        POST /api/mensajes/crear-adjunto/
        Body: { nombre, archivo (object_key), tamano_bytes, content_type }
        Crea un MensajeAdjunto SIN mensaje, asociado al perfil que lo sube.
        """
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response(
                {'error': 'Necesitas un perfil'},
                status=status.HTTP_403_FORBIDDEN,
            )

        nombre = request.data.get('nombre')
        archivo = request.data.get('archivo')
        tamano_bytes = request.data.get('tamano_bytes')
        content_type = request.data.get('content_type')

        if not nombre or not archivo:
            return Response(
                {'error': 'nombre y archivo son obligatorios'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        adjunto = MensajeAdjunto.objects.create(
            mensaje=None,
            perfil_id=mi_perfil_id,
            nombre=nombre,
            archivo=archivo,
            tamano_bytes=tamano_bytes,
            content_type=content_type,
        )
        return Response(
            MensajeAdjuntoSerializer(adjunto, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


# ==================================================================
# MENSAJE LEIDO
# ==================================================================
class MensajeLeidoViewSet(viewsets.ViewSet, MiPerfilMixin):
    permission_classes = [IsAuthenticated]

    def _mis_chat_ids(self, mi_perfil_id):
        return list(
            PerfilChat.objects.filter(perfil_id=mi_perfil_id)
            .values_list('chat_id', flat=True)
        )

    def list(self, request):
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response([], status=status.HTTP_200_OK)

        mis_chat_ids = self._mis_chat_ids(mi_perfil_id)

        qs = MensajeLeido.objects.filter(
            mensaje__chat_id__in=mis_chat_ids
        ).order_by('mensaje_id', 'perfil_id')

        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(MensajeLeidoSerializer(qs, many=True).data)

    def retrieve(self, request, mensaje_id=None, perfil_id=None):
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response(
                {'error': 'No participas en este chat'},
                status=status.HTTP_403_FORBIDDEN,
            )

        mensaje = Mensaje.objects.filter(pk=int(mensaje_id)).first()
        if not mensaje:
            return Response(
                {'error': f'Mensaje no encontrado: {mensaje_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not _es_participante(mensaje.chat_id, mi_perfil_id):
            return Response(
                {'error': 'No participas en este chat'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            obj = MensajeLeido.objects.get(mensaje_id=mensaje_id, perfil_id=perfil_id)
        except MensajeLeido.DoesNotExist:
            return Response(
                {'error': f'Nothing found for mensaje_id: {mensaje_id} and perfil_id: {perfil_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(MensajeLeidoSerializer(obj).data)

    def create(self, request):
        mensaje_id = request.data.get('mensaje_id')
        if mensaje_id is None:
            return Response(
                {'error': 'mensaje_id es un campo obligatorio'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        perfil_id = self.get_mi_perfil_id(request)
        if not perfil_id:
            return Response(
                {'error': 'Necesitas crear tu perfil antes de marcar mensajes como leídos'},
                status=status.HTTP_403_FORBIDDEN,
            )

        mensaje = Mensaje.objects.filter(pk=int(mensaje_id)).first()
        if not mensaje:
            return Response(
                {'error': f'Mensaje no encontrado: {mensaje_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not _es_participante(mensaje.chat_id, perfil_id):
            return Response(
                {'error': 'No participas en el chat de este mensaje'},
                status=status.HTTP_403_FORBIDDEN,
            )

        obj, _ = MensajeLeido.objects.get_or_create(mensaje_id=mensaje_id, perfil_id=perfil_id)
        return Response(MensajeLeidoSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, mensaje_id=None, perfil_id=None):
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id or int(perfil_id) != mi_perfil_id:
            return Response(
                {'error': 'No puedes borrar la marca de leído de otro perfil'},
                status=status.HTTP_403_FORBIDDEN,
            )

        mensaje = Mensaje.objects.filter(pk=int(mensaje_id)).first()
        if not mensaje or not _es_participante(mensaje.chat_id, mi_perfil_id):
            return Response(
                {'error': 'No participas en este chat'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            obj = MensajeLeido.objects.get(mensaje_id=mensaje_id, perfil_id=perfil_id)
        except MensajeLeido.DoesNotExist:
            return Response(
                {'error': 'Mensaje_leido no encontrado'},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = MensajeLeidoSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)