from django.db import models
from django.conf import settings


SEXOS = ('Hombre', 'Mujer', 'No binario', 'Otro', 'Prefiero no decir')


class Perfil(models.Model):
    perfil_id = models.BigAutoField(primary_key=True, db_column='perfil_id')
    nombre = models.CharField(max_length=50, db_column='nombre')
    apellido = models.CharField(max_length=50, db_column='apellido')
    correo = models.CharField(max_length=100, unique=True, db_column='correo')
    numero_telefono = models.BigIntegerField(null=True, blank=True, unique=True, db_column='numero_telefono')
    edad = models.IntegerField(null=True, blank=True, db_column='edad')
    sexo = models.CharField(max_length=18, null=True, blank=True, db_column='sexo')
    disponibilidad = models.BooleanField(default=True, db_column='disponibilidad')
    descripcion = models.CharField(max_length=300, db_column='descripcion')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='fecha_creacion')
    fecha_baja = models.DateTimeField(null=True, blank=True, db_column='fecha_baja')

    comarca = models.ForeignKey(
        'catalogo.Comarca',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='comarca_id',
        related_name='perfiles',
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.CASCADE,
        db_column='usuario_id',
        related_name='perfiles',
    )

    class Meta:
        db_table = 'perfil'
        managed = True
        verbose_name = 'Perfil'
        verbose_name_plural = 'Perfiles'
        ordering = ['perfil_id']

    def __str__(self):
        return f'{self.nombre} {self.apellido}'


class PerfilChat(models.Model):
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE,
        db_column='perfil_id', primary_key=True,
    )
    chat = models.ForeignKey(
        'chats.Chat', on_delete=models.CASCADE,
        db_column='chat_id',
    )
    fecha_union = models.DateTimeField(auto_now_add=True, db_column='fecha_union')

    class Meta:
        db_table = 'perfil_chat'
        managed = True
        unique_together = (('perfil', 'chat'),)
        verbose_name = 'Perfil-Chat'
        verbose_name_plural = 'Perfiles-Chats'

    def __str__(self):
        return f'{self.perfil_id} - {self.chat_id}'

class PerfilGeneroMusical(models.Model):
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE,
        db_column='perfil_id', primary_key=True,
    )
    genero = models.ForeignKey(
        'catalogo.GeneroMusical', on_delete=models.CASCADE,
        db_column='genero_id',
    )

    class Meta:
        db_table = 'perfil_genero_musical'
        managed = True
        unique_together = (('perfil', 'genero'),)
        verbose_name = 'Perfil-Género musical'
        verbose_name_plural = 'Perfiles-Géneros musicales'

    def __str__(self):
        return f'{self.perfil_id} - {self.genero_id}'


class PerfilGrupo(models.Model):
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE,
        db_column='perfil_id', primary_key=True,
    )
    grupo = models.ForeignKey(
        'catalogo.Grupo', on_delete=models.CASCADE,
        db_column='grupo_id',
    )

    class Meta:
        db_table = 'perfil_grupo'
        managed = True
        unique_together = (('perfil', 'grupo'),)
        verbose_name = 'Perfil-Grupo'
        verbose_name_plural = 'Perfiles-Grupos'

    def __str__(self):
        return f'{self.perfil_id} - {self.grupo_id}'


class PerfilInstrumento(models.Model):
    perfil = models.ForeignKey(
        Perfil, on_delete=models.CASCADE,
        db_column='perfil_id', primary_key=True,
    )
    instrumento = models.ForeignKey(
        'catalogo.Instrumento', on_delete=models.CASCADE,
        db_column='instrumento_id',
    )

    class Meta:
        db_table = 'perfil_instrumento'
        managed = True
        unique_together = (('perfil', 'instrumento'),)
        verbose_name = 'Perfil-Instrumento'
        verbose_name_plural = 'Perfiles-Instrumentos'

    def __str__(self):
        return f'{self.perfil_id} - {self.instrumento_id}'