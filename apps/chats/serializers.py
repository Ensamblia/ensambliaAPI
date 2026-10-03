from rest_framework import serializers
from .models import Chat, Mensaje, MensajeLeido, MensajeAdjunto


# ================ CHAT ================
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['chat_id']


# ================ MENSAJE ADJUNTO ================
class MensajeAdjuntoSerializer(serializers.ModelSerializer):
    archivo_url = serializers.SerializerMethodField()
    perfil_id = serializers.IntegerField(read_only=True, allow_null=True)
    mensaje_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = MensajeAdjunto
        fields = [
            'adjunto_id', 'nombre', 'archivo', 'archivo_url',
            'tamano_bytes', 'content_type', 'fecha_subida',
            'perfil_id', 'mensaje_id',
        ]

    def get_archivo_url(self, obj):
        if not obj.archivo:
            return None
        request = self.context.get('request')
        try:
            url = obj.archivo.url
            if request and not url.startswith('http'):
                return request.build_absolute_uri(url)
            return url
        except Exception:
            return None


# ================ MENSAJE ================
class MensajeSerializer(serializers.ModelSerializer):
    chat_id = serializers.IntegerField(read_only=True, allow_null=True)
    perfil_id = serializers.IntegerField(read_only=True, allow_null=True)
    leido_por = serializers.SerializerMethodField()
    adjuntos = MensajeAdjuntoSerializer(many=True, read_only=True)

    class Meta:
        model = Mensaje
        fields = [
            'mensaje_id', 'contenido', 'fecha_envio', 'esta_eliminado',
            'chat_id', 'perfil_id', 'leido_por', 'adjuntos',
        ]

    def get_leido_por(self, obj):
        return list(obj.lecturas.values_list('perfil_id', flat=True))


class MensajeCreateSerializer(serializers.ModelSerializer):
    chat_id = serializers.PrimaryKeyRelatedField(
        source='chat',
        queryset=Chat.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Mensaje
        fields = ['contenido', 'esta_eliminado', 'chat_id']

    def validate_contenido(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('contenido is a mandatory field. Cannot be undefined or null')
        if len(value) < 1 or len(value) > 500:
            raise serializers.ValidationError('El contenido debe tener entre 1 y 500 caracteres')
        return value.strip()


class MensajeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mensaje
        fields = ['contenido', 'esta_eliminado']

    def validate_contenido(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Contenido is a mandatory field. Cannot be undefined or null')
        return value.strip()


# ================ MENSAJE LEIDO ================
class MensajeLeidoSerializer(serializers.ModelSerializer):
    mensaje_id = serializers.IntegerField(read_only=True, allow_null=True)
    perfil_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = MensajeLeido
        fields = ['mensaje_id', 'perfil_id', 'leido_en']