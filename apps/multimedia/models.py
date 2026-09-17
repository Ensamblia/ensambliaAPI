from django.db import models


class Multimedia(models.Model):
    multimedia_id = models.BigAutoField(primary_key=True, db_column='multimedia_id')
    nombre = models.CharField(max_length=50, db_column='nombre')
    ruta_archivo = models.CharField(max_length=500, db_column='ruta_archivo')
    tamano_bytes = models.BigIntegerField(null=True, blank=True, db_column='tamano_bytes')
    fecha_subida = models.DateTimeField(auto_now_add=True, db_column='fecha_subida')

    tipo = models.ForeignKey(
        'catalogo.TipoArchivo',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='tipo_id',
        related_name='multimedias',
    )
    perfil = models.ForeignKey(
        'perfiles.Perfil',
        null=True, blank=True,
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='multimedias',
    )
    anuncio = models.ForeignKey(
        'anuncios.Anuncio',
        null=True, blank=True,
        on_delete=models.CASCADE,
        db_column='anuncio_id',
        related_name='multimedias',
    )

    class Meta:
        db_table = 'multimedia'
        managed = True
        verbose_name = 'Multimedia'
        verbose_name_plural = 'Multimedia'
        ordering = ['-fecha_subida']

    def __str__(self):
        return self.nombre