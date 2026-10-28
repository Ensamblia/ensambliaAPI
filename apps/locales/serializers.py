from rest_framework import serializers
from apps.catalogo.models import Ciudad
from apps.perfiles.models import Perfil
from apps.perfiles.serializers import PerfilSerializer
from .models import Local


class LocalDatosSerializer(serializers.ModelSerializer):
    ciudad_id = serializers.IntegerField(read_only=True)
    ciudad = serializers.CharField(source='ciudad.nombre', read_only=True)
    comarca_id = serializers.IntegerField(source='ciudad.comarca_id', read_only=True, allow_null=True)

    class Meta:
        model = Local
        fields = ['ciudad_id', 'ciudad', 'comarca_id', 'direccion', 'aforo', 'tipos']


class LocalWriteSerializer(serializers.ModelSerializer):
    ciudad_id = serializers.PrimaryKeyRelatedField(
        source='ciudad',
        queryset=Ciudad.objects.all(),
    )
    tipos = serializers.ListField(
        child=serializers.ChoiceField(choices=Local.TipoLocal.choices),
    )

    class Meta:
        model = Local
        fields = ['ciudad_id', 'direccion', 'aforo', 'tipos']

    def validate_direccion(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('La dirección es obligatoria')
        return value.strip()

    def validate_tipos(self, value):
        if not value:
            raise serializers.ValidationError('Indica al menos un tipo de local')
        if len(set(value)) != len(value):
            raise serializers.ValidationError('Hay tipos de local repetidos')
        return value


class LocalPerfilSerializer(serializers.ModelSerializer):
    """Un perfil local con sus datos de local y, si se calculó, su afinidad."""
    comarca_id = serializers.IntegerField(read_only=True, allow_null=True)
    local = serializers.SerializerMethodField()
    generos = serializers.SerializerMethodField()
    generos_comunes = serializers.SerializerMethodField()
    misma_comarca = serializers.SerializerMethodField()

    class Meta:
        model = Perfil
        fields = [
            'perfil_id', 'nombre', 'descripcion', 'disponibilidad', 'comarca_id',
            'local', 'generos', 'generos_comunes', 'misma_comarca',
        ]

    def get_local(self, obj):
        try:
            return LocalDatosSerializer(obj.local).data
        except Local.DoesNotExist:
            return None

    def get_generos(self, obj):
        # Solo genero_id: en la BD real la pivote no tiene columna id
        ids = getattr(obj, 'generos_ids', None)
        if ids is None:
            ids = obj.perfil_generos.values_list('genero_id', flat=True)
        return sorted(ids)

    def get_generos_comunes(self, obj):
        return getattr(obj, 'generos_comunes', None)

    def get_misma_comarca(self, obj):
        return getattr(obj, 'misma_comarca', None)


class ArtistaSugeridoSerializer(PerfilSerializer):
    generos_comunes = serializers.IntegerField(read_only=True)
    misma_comarca = serializers.BooleanField(read_only=True)

    class Meta(PerfilSerializer.Meta):
        fields = PerfilSerializer.Meta.fields + ['generos_comunes', 'misma_comarca']
