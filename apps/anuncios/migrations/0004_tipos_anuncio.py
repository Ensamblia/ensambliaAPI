from django.db import migrations

from apps.anuncios.tipos_anuncio import cargar_tipos_anuncio


def cargar(apps, schema_editor):
    cargar_tipos_anuncio(apps.get_model('anuncios', 'TipoAnuncio'))


class Migration(migrations.Migration):

    dependencies = [
        ('anuncios', '0003_anunciomultimedia'),
    ]

    operations = [
        # Sin reverse que borre: pueden estar ya en uso por anuncios
        migrations.RunPython(cargar, migrations.RunPython.noop),
    ]
