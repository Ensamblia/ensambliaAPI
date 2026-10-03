from django.db import models


class Multimedia(models.Model):
    """
    Biblioteca de medios de un perfil.
    Los archivos NO se referencian directamente a anuncios;
    para eso se usa la tabla pivote AnuncioMultimedia (ver FASE 6).
    """
    multimedia_id = models.BigAutoField(primary_key=True, db_column='multimedia_id')
    nombre = models.CharField(max_length=50, db_column='nombre')
    archivo = models.FileField(
        upload_to='multimedia/%Y/%m/',
        db_column='ruta_archivo',
        max_length=500,
        null=True, blank=True,
    )
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

    class Meta:
        db_table = 'multimedia'
        managed = True
        verbose_name = 'Multimedia'
        verbose_name_plural = 'Multimedia'
        ordering = ['-fecha_subida']

    def __str__(self):
        return self.nombre