from rest_framework import serializers
from .models import (
    Comarca, Ciudad, Instrumento, GeneroMusical, Grupo, GrupoGenero, TipoArchivo,
)


class ComarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comarca
        fields = ['comarca_id', 'nombre']
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'blank': 'El nombre es obligatorio',
                    'max_length': 'El nombre no puede superar los 50 caracteres',
                }
            }
        }




class InstrumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrumento
        fields = ['instrumento_id', 'nombre']
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'blank': 'El nombre es obligatorio',
                    'max_length': 'El nombre no puede superar los 25 caracteres',
                }
            }
        }


class GeneroMusicalSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneroMusical
        fields = ['genero_musical_id', 'nombre']
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'blank': 'El nombre es obligatorio',
                    'max_length': 'El nombre no puede superar los 50 caracteres',
                }
            }
        }




class GrupoGeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoGenero
        fields = ['grupo_id', 'genero_id']


class TipoArchivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoArchivo
        fields = ['tipo_archivo_id', 'nombre', 'extension', 'mime_type']
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'blank': 'El nombre es obligatorio',
                    'max_length': 'El nombre no puede superar los 10 caracteres',
                }
            },
            'extension': {
                'error_messages': {
                    'blank': 'La extensión es obligatoria',
                    'max_length': 'La extensión no puede superar los 10 caracteres',
                }
            },
            'mime_type': {
                'error_messages': {
                    'blank': 'El mime_type es obligatorio',
                    'max_length': 'El mime_type no puede superar los 100 caracteres',
                }
            },
        }

    def validate_extension(self, value):
        if not value.startswith('.'):
            raise serializers.ValidationError(
                "La extensión debe comenzar con un punto (ej: '.jpg')"
            )
        return value

class CiudadSerializer(serializers.ModelSerializer):
    comarca_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Ciudad
        fields = ['ciudad_id', 'nombre', 'comarca_id']
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'blank': 'El nombre es obligatorio',
                    'max_length': 'El nombre no puede superar los 75 caracteres',
                }
            }
        }


class CiudadCreateSerializer(serializers.ModelSerializer):
    comarca_id = serializers.PrimaryKeyRelatedField(
        source='comarca',
        queryset=Comarca.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Ciudad
        fields = ['nombre', 'comarca_id']

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El nombre es obligatorio')
        if len(value) > 75:
            raise serializers.ValidationError('El nombre no puede superar los 75 caracteres')
        return value.strip()

    class Meta:
        model = Ciudad
        fields = ['nombre', 'comarca_id']

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El nombre es obligatorio')
        if len(value) > 75:
            raise serializers.ValidationError('El nombre no puede superar los 75 caracteres')
        return value.strip()


class GrupoSerializer(serializers.ModelSerializer):
    creador_perfil_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Grupo
        fields = ['grupo_id', 'nombre', 'descripcion', 'creador_perfil_id']
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'blank': 'El nombre es obligatorio',
                    'max_length': 'El nombre no puede superar los 50 caracteres',
                }
            },
            'descripcion': {
                'error_messages': {
                    'max_length': 'La descripción no puede superar los 500 caracteres',
                }
            },
        }


class GrupoSerializer(serializers.ModelSerializer):
    creador_perfil_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Grupo
        fields = ['grupo_id', 'nombre', 'descripcion', 'creador_perfil_id']
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'blank': 'El nombre es obligatorio',
                    'max_length': 'El nombre no puede superar los 50 caracteres',
                }
            },
            'descripcion': {
                'error_messages': {
                    'max_length': 'La descripción no puede superar los 500 caracteres',
                }
            },
        }


class GrupoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ['nombre', 'descripcion']

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El nombre es obligatorio')
        if len(value) > 50:
            raise serializers.ValidationError('El nombre no puede superar los 50 caracteres')
        return value.strip()

    def validate_descripcion(self, value):
        if value is not None and len(value) > 500:
            raise serializers.ValidationError('La descripción no puede superar los 500 caracteres')
        return value