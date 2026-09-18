from django.db import models


class Comarca(models.Model):
    comarca_id = models.BigAutoField(primary_key=True, db_column='comarca_id')
    nombre = models.CharField(max_length=50, db_column='nombre')

    class Meta:
        db_table = 'comarca'
        managed = True
        verbose_name = 'Comarca'
        verbose_name_plural = 'Comarcas'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Ciudad(models.Model):
    ciudad_id = models.BigAutoField(primary_key=True, db_column='ciudad_id')
    nombre = models.CharField(max_length=75, db_column='nombre')
    comarca = models.ForeignKey(
        Comarca, null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='comarca_id',
        related_name='ciudades',
    )

    class Meta:
        db_table = 'ciudad'
        managed = True
        verbose_name = 'Ciudad'
        verbose_name_plural = 'Ciudades'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Instrumento(models.Model):
    instrumento_id = models.BigAutoField(primary_key=True, db_column='instrumento_id')
    nombre = models.CharField(max_length=25, db_column='nombre')

    class Meta:
        db_table = 'instrumento'
        managed = True
        verbose_name = 'Instrumento'
        verbose_name_plural = 'Instrumentos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class GeneroMusical(models.Model):
    genero_musical_id = models.BigAutoField(primary_key=True, db_column='genero_musical_id')
    nombre = models.CharField(max_length=50, db_column='nombre')

    class Meta:
        db_table = 'genero_musical'
        managed = True
        verbose_name = 'Género musical'
        verbose_name_plural = 'Géneros musicales'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Grupo(models.Model):
    grupo_id = models.BigAutoField(primary_key=True, db_column='grupo_id')
    nombre = models.CharField(max_length=50, db_column='nombre')
    descripcion = models.CharField(max_length=500, null=True, blank=True, db_column='descripcion')
    creador_perfil = models.ForeignKey(
        'perfiles.Perfil',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='creador_perfil_id',
        related_name='grupos_creados',
    )

    class Meta:
        db_table = 'grupo'
        managed = True
        verbose_name = 'Grupo'
        verbose_name_plural = 'Grupos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class GrupoGenero(models.Model):
    grupo = models.ForeignKey(
        Grupo, on_delete=models.CASCADE,
        db_column='grupo_id', primary_key=True,
    )
    genero = models.ForeignKey(
        GeneroMusical, on_delete=models.CASCADE,
        db_column='genero_id',
    )

    class Meta:
        db_table = 'grupo_genero'
        managed = True
        unique_together = (('grupo', 'genero'),)
        verbose_name = 'Grupo-Género'
        verbose_name_plural = 'Grupos-Géneros'

    def __str__(self):
        return f'{self.grupo_id} - {self.genero_id}'


class TipoArchivo(models.Model):
    tipo_archivo_id = models.BigAutoField(primary_key=True, db_column='tipo_archivo_id')
    nombre = models.CharField(max_length=10, db_column='nombre')
    extension = models.CharField(max_length=10, db_column='extension')
    mime_type = models.CharField(max_length=100, db_column='mime_type')  # ampliado

    class Meta:
        db_table = 'tipo_archivo'
        managed = True
        verbose_name = 'Tipo de archivo'
        verbose_name_plural = 'Tipos de archivo'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre