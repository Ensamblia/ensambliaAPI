from django.db import models


class TipoAnuncio(models.Model):
    """
    Tabla: tipo_anuncio
    La columna en DB se llama `nombre`, pero se expone al front como `tipo`.
    """
    tipo_anuncio_id = models.BigAutoField(primary_key=True, db_column='tipo_anuncio_id')
    nombre = models.CharField(max_length=50, db_column='nombre')

    class Meta:
        db_table = 'tipo_anuncio'
        managed = True
        verbose_name = 'Tipo de anuncio'
        verbose_name_plural = 'Tipos de anuncio'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Anuncio(models.Model):
    anuncio_id = models.BigAutoField(primary_key=True, db_column='anuncio_id')
    fecha_publicacion = models.DateTimeField(auto_now_add=True, db_column='fecha_publicacion')
    titulo = models.CharField(max_length=160, db_column='titulo')
    contenido = models.CharField(max_length=750, db_column='contenido')

    perfil = models.ForeignKey(
        'perfiles.Perfil',
        null=True, blank=True,
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='anuncios',
    )
    tipo_anuncio = models.ForeignKey(
        TipoAnuncio,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='tipo_anuncio_id',
        related_name='anuncios',
    )

    class Meta:
        db_table = 'anuncio'
        managed = True
        verbose_name = 'Anuncio'
        verbose_name_plural = 'Anuncios'
        ordering = ['-fecha_publicacion']

    def __str__(self):
        return self.titulo


class Comentario(models.Model):
    comentario_id = models.BigAutoField(primary_key=True, db_column='comentario_id')
    contenido = models.CharField(max_length=500, db_column='contenido')
    fecha_publicacion = models.DateTimeField(auto_now_add=True, db_column='fecha_publicacion')
    esta_eliminado = models.BooleanField(default=False, db_column='esta_eliminado')

    anuncio = models.ForeignKey(
        Anuncio,
        null=True, blank=True,
        on_delete=models.CASCADE,
        db_column='anuncio_id',
        related_name='comentarios',
    )
    perfil = models.ForeignKey(
        'perfiles.Perfil',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='perfil_id',
        related_name='comentarios',
    )

    class Meta:
        db_table = 'comentario'
        managed = True
        verbose_name = 'Comentario'
        verbose_name_plural = 'Comentarios'
        ordering = ['-fecha_publicacion']

    def __str__(self):
        return f'Comentario {self.comentario_id}'