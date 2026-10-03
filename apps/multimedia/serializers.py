from rest_framework import serializers
from apps.catalogo.models import TipoArchivo
from apps.anuncios.models import Anuncio
from .models import Multimedia


class MultimediaSerializer(serializers.ModelSerializer):
    archivo_url = serializers.SerializerMethodField()
    tipo_id = serializers.IntegerField(read_only=True, allow_null=True)
    tipo_mime = serializers.SerializerMethodField()
    perfil_id = serializers.IntegerField(read_only=True, allow_null=True)
    anuncio_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Multimedia
        fields = [
            'multimedia_id', 'nombre', 'archivo', 'archivo_url', 'tamano_bytes',
            'tipo_id', 'tipo_mime', 'perfil_id', 'anuncio_id', 'fecha_subida',
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

    def get_tipo_mime(self, obj):
        """
        Devuelve el MIME type del archivo.
        Primero intenta leerlo del TipoArchivo relacionado; si no existe,
        lo deduce de la extensión del nombre del archivo.
        """
        if obj.tipo and obj.tipo.mime_type:
            return obj.tipo.mime_type

        # Fallback: deducir por extensión
        nombre = (obj.nombre or '').lower()
        ext = nombre.rsplit('.', 1)[-1] if '.' in nombre else ''

        mapa = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'weba': 'audio/webm',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'mov': 'video/quicktime',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'odt': 'application/vnd.oasis.opendocument.text',
        }
        return mapa.get(ext, 'application/octet-stream')


class MultimediaCreateSerializer(serializers.ModelSerializer):
    archivo = serializers.CharField(max_length=500)  # ← object_key (string)
    tipo_id = serializers.PrimaryKeyRelatedField(
        source='tipo',
        queryset=TipoArchivo.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Multimedia
        fields = ['nombre', 'archivo', 'tamano_bytes', 'tipo_id']

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('nombre es un campo obligatorio')
        if len(value) > 50:
            raise serializers.ValidationError('El nombre no puede superar los 50 caracteres')
        return value.strip()

    def validate_archivo(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('archivo es un campo obligatorio')
        return value.strip()


class MultimediaUpdateSerializer(serializers.ModelSerializer):
    archivo = serializers.CharField(max_length=500, required=False)
    tipo_id = serializers.PrimaryKeyRelatedField(
        source='tipo',
        queryset=TipoArchivo.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Multimedia
        fields = ['nombre', 'archivo', 'tamano_bytes', 'tipo_id']