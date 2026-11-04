from django.db import migrations

from apps.catalogo.generos_musicales import cargar_generos


def cargar(apps, schema_editor):
    cargar_generos(apps.get_model('catalogo', 'GeneroMusical'))


class Migration(migrations.Migration):

    dependencies = [
        ('catalogo', '0004_municipios_catalunya'),
    ]

    operations = [
        # Sin reverse que borre: los géneros pueden estar ya en uso por perfiles, grupos y eventos
        migrations.RunPython(cargar, migrations.RunPython.noop),
    ]
