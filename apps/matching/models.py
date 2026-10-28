from django.contrib.postgres.fields import ArrayField
from django.db import models


class BusquedaAnuncio(models.Model):
    """
    "¿Qué buscas?" de un anuncio (1:1, todo opcional): qué tipo de perfil,
    qué instrumento y qué estilos busca quien lo publica. Alimenta el match.
    """
    anuncio = models.OneToOneField(
        'anuncios.Anuncio',
        primary_key=True,
        on_delete=models.CASCADE,
        db_column='anuncio_id',
        related_name='busqueda',
    )
    tipo_perfil = models.CharField(
        max_length=20, null=True, blank=True,
        choices=[('usuario', 'Músico'), ('grupo', 'Grupo'), ('local', 'Local')],
        db_column='tipo_perfil',
    )
    instrumento = models.ForeignKey(
        'catalogo.Instrumento',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='instrumento_id',
        related_name='busquedas_anuncio',
    )
    # Ids de catalogo.GeneroMusical. Array y no pivote: son pocos y solo se leen juntos
    generos = ArrayField(models.BigIntegerField(), default=list, blank=True, db_column='generos')

    class Meta:
        db_table = 'busqueda_anuncio'
        managed = True
        verbose_name = 'Búsqueda de anuncio'
        verbose_name_plural = 'Búsquedas de anuncios'

    def __str__(self):
        return f'{self.anuncio_id}'
