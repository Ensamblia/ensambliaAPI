from rest_framework import serializers
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializa nickname como `usuario` (compatibilidad con React)."""
    usuario = serializers.CharField(source='nickname')

    class Meta:
        model = Usuario
        fields = ['usuario_id', 'usuario', 'creado_en', 'is_staff']
        read_only_fields = ['usuario_id', 'creado_en', 'is_staff']


class RegistroSerializer(serializers.Serializer):
    usuario = serializers.CharField(min_length=3, max_length=50)
    password = serializers.CharField(min_length=6, write_only=True)


class LoginSerializer(serializers.Serializer):
    usuario = serializers.CharField()
    password = serializers.CharField(write_only=True)
    

class TestimonioSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    rol = serializers.CharField()
    quote = serializers.CharField()


class StatsSerializer(serializers.Serializer):
    usuarios_activos = serializers.IntegerField()
    usuarios_online = serializers.IntegerField()
    grupos_formados = serializers.IntegerField()
    anuncios_mes = serializers.IntegerField()
    matches = serializers.IntegerField()
    testimonios = TestimonioSerializer(many=True)