from django.utils import timezone
from rest_framework import serializers

from apps.catalogo.models import Ciudad, GeneroMusical
from apps.perfiles.models import Perfil
from .models import Evento


class EventoSerializer(serializers.ModelSerializer):
    """Lectura: datos del evento con autor, local, ciudad y estilos resueltos."""
    ciudad_id = serializers.IntegerField(read_only=True)
    ciudad = serializers.CharField(source='ciudad.nombre', read_only=True)
    comarca_id = serializers.IntegerField(source='ciudad.comarca_id', read_only=True, allow_null=True)
    autor = serializers.SerializerMethodField()
    local = serializers.SerializerMethodField()
    generos = serializers.SerializerMethodField()

    class Meta:
        model = Evento
        fields = [
            'evento_id', 'titulo', 'descripcion', 'fecha_inicio', 'precio', 'lugar',
            'ciudad_id', 'ciudad', 'comarca_id', 'autor', 'local', 'generos',
        ]

    def get_autor(self, obj):
        p = obj.perfil
        return {'perfil_id': p.perfil_id, 'nombre': p.nombre, 'apellido': p.apellido, 'tipo': p.tipo}

    def get_local(self, obj):
        return {'perfil_id': obj.local.perfil_id, 'nombre': obj.local.nombre} if obj.local else None

    def get_generos(self, obj):
        nombres = self.context.get('nombres_genero')
        if nombres is None:
            nombres = dict(GeneroMusical.objects.filter(pk__in=obj.generos).values_list('genero_musical_id', 'nombre'))
        return sorted(
            ({'genero_musical_id': g, 'nombre': nombres[g]} for g in obj.generos if g in nombres),
            key=lambda g: g['nombre'],
        )


class EventoWriteSerializer(serializers.ModelSerializer):
    ciudad_id = serializers.PrimaryKeyRelatedField(
        source='ciudad', queryset=Ciudad.objects.all(), required=False,
    )
    local_id = serializers.PrimaryKeyRelatedField(
        source='local', queryset=Perfil.objects.all(), required=False, allow_null=True,
    )
    generos = serializers.ListField(child=serializers.IntegerField(), required=False)

    class Meta:
        model = Evento
        fields = ['titulo', 'descripcion', 'fecha_inicio', 'precio', 'lugar', 'ciudad_id', 'local_id', 'generos']

    def validate_titulo(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El título es obligatorio')
        return value.strip()

    def validate_fecha_inicio(self, value):
        # Al crear tiene que ser futura; al editar se permite dejar la que tenía
        if self.instance is None and value <= timezone.now():
            raise serializers.ValidationError('La fecha del evento tiene que ser futura')
        return value

    def validate_local_id(self, value):
        if value is not None and (value.tipo != Perfil.TipoPerfil.LOCAL or not hasattr(value, 'local')):
            raise serializers.ValidationError('El local tiene que ser un perfil de local con sus datos completos')
        return value

    def validate_generos(self, value):
        ids = list(dict.fromkeys(value))
        if GeneroMusical.objects.filter(pk__in=ids).count() != len(ids):
            raise serializers.ValidationError('Hay estilos que no existen')
        return ids

    def validate(self, attrs):
        # Si se celebra en un local de Ensamblia y no se indica ciudad, es la del local
        local = attrs.get('local')
        if 'ciudad' not in attrs and local is not None:
            attrs['ciudad'] = local.local.ciudad
        if self.instance is None and 'ciudad' not in attrs:
            raise serializers.ValidationError({'ciudad_id': 'Indica la ciudad o el local del evento'})
        return attrs
