from rest_framework import serializers
from apps.catalogo.models import GeneroMusical, Instrumento
from apps.perfiles.models import Perfil


class BusquedaAnuncioWriteSerializer(serializers.Serializer):
    tipo_perfil = serializers.ChoiceField(
        choices=Perfil.TipoPerfil.choices, allow_null=True, required=False, default=None,
    )
    instrumento_id = serializers.PrimaryKeyRelatedField(
        source='instrumento', queryset=Instrumento.objects.all(),
        allow_null=True, required=False, default=None,
    )
    generos = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)

    def validate_generos(self, value):
        ids = list(dict.fromkeys(value))
        existentes = set(GeneroMusical.objects.filter(pk__in=ids).values_list('pk', flat=True))
        if len(existentes) != len(ids):
            raise serializers.ValidationError('Hay estilos que no existen')
        return ids
