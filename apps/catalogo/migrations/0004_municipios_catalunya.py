from django.db import migrations

from apps.catalogo.municipios_catalunya import cargar_municipios


def cargar(apps, schema_editor):
    cargar_municipios(apps.get_model('catalogo', 'Ciudad'), apps.get_model('catalogo', 'Comarca'))


class Migration(migrations.Migration):

    dependencies = [
        ('catalogo', '0003_comarcas_catalunya'),
    ]

    operations = [
        # Sin reverse que borre: los municipios pueden estar ya en uso por perfiles y locales
        migrations.RunPython(cargar, migrations.RunPython.noop),
    ]
