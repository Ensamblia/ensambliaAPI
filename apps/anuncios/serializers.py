from rest_framework import serializers
from .models import TipoAnuncio, Anuncio, Comentario


# ================ TIPO ANUNCIO ================
class TipoAnuncioSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source='nombre')

    class Meta:
        model = TipoAnuncio
        fields = ['tipo_anuncio_id', 'tipo']


class TipoAnuncioCreateSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source='nombre', max_length=50)

    class Meta:
        model = TipoAnuncio
        fields = ['tipo']

    def validate_tipo(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El tipo es obligatorio')
        if len(value) > 50:
            raise serializers.ValidationError('El tipo no puede superar los 50 caracteres')
        return value.strip()


# ================ ANUNCIO ================
class AnuncioSerializer(serializers.ModelSerializer):
    tipo_anuncio_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Anuncio
        fields = [
            'anuncio_id', 'fecha_publicacion', 'titulo', 'contenido',
            'perfil_id', 'tipo_anuncio_id',
        ]


class AnuncioCreateSerializer(serializers.ModelSerializer):
    tipo_anuncio_id = serializers.PrimaryKeyRelatedField(
        source='tipo_anuncio',
        queryset=TipoAnuncio.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Anuncio
        fields = ['titulo', 'contenido', 'tipo_anuncio_id']

    def validate_titulo(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Titulo is a mandatory field. Cannot be undefined or null')
        if len(value) < 3 or len(value) > 160:
            raise serializers.ValidationError('El título debe tener entre 3 y 160 caracteres')
        return value.strip()

    def validate_contenido(self, value):
        if value is None:
            return None
        if len(value) < 10 or len(value) > 750:
            raise serializers.ValidationError('El contenido debe tener entre 10 y 750 caracteres')
        return value


class AnuncioUpdateSerializer(serializers.ModelSerializer):
    tipo_anuncio_id = serializers.PrimaryKeyRelatedField(
        source='tipo_anuncio',
        queryset=TipoAnuncio.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Anuncio
        fields = ['titulo', 'contenido', 'tipo_anuncio_id']

    def validate_titulo(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Titulo is a mandatory field. Cannot be undefined or null')
        return value.strip()

    def validate_contenido(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Contenido is a mandatory field. Cannot be undefined or null')
        return value


# ================ COMENTARIO ================
class ComentarioSerializer(serializers.ModelSerializer):
    anuncio_id = serializers.IntegerField(read_only=True, allow_null=True)
    perfil_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Comentario
        fields = [
            'comentario_id', 'contenido', 'fecha_publicacion',
            'esta_eliminado', 'anuncio_id', 'perfil_id',
        ]


class ComentarioCreateSerializer(serializers.ModelSerializer):
    anuncio_id = serializers.PrimaryKeyRelatedField(
        source='anuncio',
        queryset=Anuncio.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Comentario
        fields = ['contenido', 'esta_eliminado', 'anuncio_id']

    def validate_contenido(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('contenido is a mandatory field. Cannot be undefined or null')
        if len(value) < 3 or len(value) > 500:
            raise serializers.ValidationError('El contenido debe tener entre 3 y 500 caracteres')
        return value.strip()


class ComentarioUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = ['contenido', 'esta_eliminado']

    def validate_contenido(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Contenido is a mandatory field. Cannot be undefined or null')
        return value.strip()