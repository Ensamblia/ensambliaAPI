from rest_framework import serializers
from .models import Chat, Mensaje, MensajeLeido


# ================ CHAT ================
class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['chat_id']


# ================ MENSAJE ================
class MensajeSerializer(serializers.ModelSerializer):
    chat_id = serializers.IntegerField(read_only=True, allow_null=True)
    perfil_id = serializers.IntegerField(read_only=True, allow_null=True)
    leido_por = serializers.SerializerMethodField()

    class Meta:
        model = Mensaje
        fields = [
            'mensaje_id', 'contenido', 'fecha_envio', 'esta_eliminado',
            'chat_id', 'perfil_id', 'leido_por',
        ]

    def get_leido_por(self, obj):
        """Lista de perfil_id que han leído este mensaje."""
        return list(obj.mensajeleido_set.values_list('perfil_id', flat=True))


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