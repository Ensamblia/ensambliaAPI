from django.db import migrations

from apps.catalogo.catalogos_musicales import (
    GENEROS_MUSICALES, INSTRUMENTOS, cargar_por_nombre,
)


def cargar(apps, schema_editor):
    cargar_por_nombre(apps.get_model('catalogo', 'Instrumento'), INSTRUMENTOS)
    cargar_por_nombre(apps.get_model('catalogo', 'GeneroMusical'), GENEROS_MUSICALES)


class Migration(migrations.Migration):

    dependencies = [
        ('catalogo', '0004_municipios_catalunya'),
    ]

    operations = [
        # Sin reverse que borre: pueden estar ya en uso por perfiles y anuncios
        migrations.RunPython(cargar, migrations.RunPython.noop),
    ]
