from rest_framework import serializers
from apps.catalogo.models import TipoArchivo
from apps.anuncios.models import Anuncio
from .models import Multimedia


class MultimediaSerializer(serializers.ModelSerializer):
    tipo_id = serializers.IntegerField(read_only=True, allow_null=True)
    perfil_id = serializers.IntegerField(read_only=True, allow_null=True)
    anuncio_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Multimedia
        fields = [
            'multimedia_id', 'nombre', 'ruta_archivo', 'tamano_bytes',
            'tipo_id', 'perfil_id', 'anuncio_id', 'fecha_subida',
        ]


class MultimediaCreateSerializer(serializers.ModelSerializer):
    tipo_id = serializers.PrimaryKeyRelatedField(
        source='tipo',
        queryset=TipoArchivo.objects.all(),
        required=False,
        allow_null=True,
    )
    anuncio_id = serializers.PrimaryKeyRelatedField(
        source='anuncio',
        queryset=Anuncio.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Multimedia
        fields = ['nombre', 'ruta_archivo', 'tamano_bytes', 'tipo_id', 'anuncio_id']

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('nombre es un campo obligatorio')
        if len(value) > 50:
            raise serializers.ValidationError('El nombre no puede superar los 50 caracteres')
        return value.strip()

    def validate_ruta_archivo(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('ruta_archivo es un campo obligatorio')
        if len(value) > 500:
            raise serializers.ValidationError('La ruta no puede superar los 500 caracteres')
        return value.strip()


class MultimediaUpdateSerializer(serializers.ModelSerializer):
    tipo_id = serializers.PrimaryKeyRelatedField(
        source='tipo',
        queryset=TipoArchivo.objects.all(),
        required=False,
        allow_null=True,
    )
    anuncio_id = serializers.PrimaryKeyRelatedField(
        source='anuncio',
        queryset=Anuncio.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Multimedia
        fields = ['nombre', 'ruta_archivo', 'tamano_bytes', 'tipo_id', 'anuncio_id']