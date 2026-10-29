from django.db import migrations

from apps.catalogo.comarcas_catalunya import cargar_comarcas


def cargar(apps, schema_editor):
    cargar_comarcas(apps.get_model('catalogo', 'Comarca'))


class Migration(migrations.Migration):

    dependencies = [
        ('catalogo', '0002_initial'),
    ]

    operations = [
        # Sin reverse que borre: las comarcas pueden estar ya en uso por perfiles
        migrations.RunPython(cargar, migrations.RunPython.noop),
    ]
