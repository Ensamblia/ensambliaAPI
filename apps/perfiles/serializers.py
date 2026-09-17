from rest_framework import serializers
from apps.catalogo.models import Comarca
from .models import (
    Perfil, PerfilChat, PerfilGeneroMusical, PerfilGrupo, PerfilInstrumento,
    SEXOS
)


class PerfilSerializer(serializers.ModelSerializer):
    comarca_id = serializers.IntegerField(read_only=True, allow_null=True)
    usuario_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Perfil
        fields = [
            'perfil_id', 'nombre', 'apellido', 'correo', 'numero_telefono',
            'edad', 'sexo', 'disponibilidad', 'descripcion',
            'fecha_creacion', 'fecha_baja',
            'comarca_id', 'usuario_id',
        ]
        read_only_fields = ['perfil_id', 'fecha_creacion', 'fecha_baja']


class PerfilCreateSerializer(serializers.ModelSerializer):
    comarca_id = serializers.PrimaryKeyRelatedField(
        source='comarca',
        queryset=Comarca.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Perfil
        fields = [
            'nombre', 'apellido', 'correo', 'numero_telefono',
            'edad', 'sexo', 'disponibilidad', 'descripcion', 'comarca_id',
        ]

    def validate_nombre(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El nombre es obligatorio')
        return value.strip()

    def validate_apellido(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El apellido es obligatorio')
        return value.strip()

    def validate_correo(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El correo es obligatorio')
        return value.strip()

    def validate_descripcion(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('La descripción es obligatoria')
        return value.strip()

    def validate_sexo(self, value):
        if value is not None and value not in SEXOS:
            raise serializers.ValidationError(
                f'sexo debe ser uno de: {", ".join(SEXOS)}'
            )
        return value
class PerfilUpdateSerializer(serializers.ModelSerializer):
    comarca_id = serializers.PrimaryKeyRelatedField(
        source='comarca',
        queryset=Comarca.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Perfil
        fields = [
            'nombre', 'apellido', 'correo', 'numero_telefono',
            'edad', 'sexo', 'disponibilidad', 'descripcion', 'comarca_id',
        ]

    def validate_sexo(self, value):
        if value is not None and value not in SEXOS:
            raise serializers.ValidationError(
                f'sexo debe ser uno de: {", ".join(SEXOS)}'
            )
        return value
    
class PerfilChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilChat
        fields = ['perfil_id', 'chat_id', 'fecha_union']


class PerfilGeneroMusicalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilGeneroMusical
        fields = ['perfil_id', 'genero_id']


class PerfilGrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilGrupo
        fields = ['perfil_id', 'grupo_id']


class PerfilInstrumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilInstrumento
        fields = ['perfil_id', 'instrumento_id']