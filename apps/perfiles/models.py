from django.db import models
from django.conf import settings


SEXOS = ('Hombre', 'Mujer', 'Otro', 'Prefiero no decir')


class Perfil(models.Model):
    class TipoPerfil(models.TextChoices):
        USUARIO = 'usuario', 'Usuario'
        GRUPO = 'grupo', 'Grupo'
        LOCAL = 'local', 'Local'
    perfil_id = models.BigAutoField(primary_key=True, db_column='perfil_id')
    nombre = models.CharField(max_length=50, db_column='nombre')
    apellido = models.CharField(max_length=50, db_column='apellido')
    correo = models.CharField(max_length=100, unique=True, db_column='correo')
    numero_telefono = models.BigIntegerField(null=True, blank=True, unique=True, db_column='numero_telefono')
    edad = models.IntegerField(null=True, blank=True, db_column='edad')
    sexo = models.CharField(max_length=18, null=True, blank=True, db_column='sexo')
    disponibilidad = models.BooleanField(default=True, db_column='disponibilidad')
    descripcion = models.CharField(max_length=300, db_column='descripcion')
    tipo = models.CharField(
        max_length=20,
        choices=TipoPerfil.choices,
        default=TipoPerfil.USUARIO,
        db_column='tipo',
    )
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
        constraints = [
            models.UniqueConstraint(
                fields=['usuario'],
                condition=models.Q(tipo='usuario'),
                name='unique_perfil_personal_por_usuario',
            ),
        ]

    def __str__(self):
        return f'{self.nombre} {self.apellido}'


class PerfilChat(models.Model):
    """
    Tabla pivote entre Perfil y Chat.
    PK propia + unique_together sobre la pareja.
    """
    id = models.BigAutoField(primary_key=True)
    perfil = models.ForeignKey(
        Perfil,
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='perfil_chats',
    )
    chat = models.ForeignKey(
        'chats.Chat',
        on_delete=models.CASCADE,
        db_column='chat_id',
        related_name='perfil_chats',
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
    """Tabla pivote entre Perfil y GeneroMusical."""
    id = models.BigAutoField(primary_key=True)
    perfil = models.ForeignKey(
        Perfil,
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='perfil_generos',
    )
    genero = models.ForeignKey(
        'catalogo.GeneroMusical',
        on_delete=models.CASCADE,
        db_column='genero_id',
        related_name='perfil_generos',
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
    """Tabla pivote entre Perfil y Grupo."""
    id = models.BigAutoField(primary_key=True)
    perfil = models.ForeignKey(
        Perfil,
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='perfil_grupos',
    )
    grupo = models.ForeignKey(
        'catalogo.Grupo',
        on_delete=models.CASCADE,
        db_column='grupo_id',
        related_name='perfil_grupos',
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
    """Tabla pivote entre Perfil e Instrumento."""
    id = models.BigAutoField(primary_key=True)
    perfil = models.ForeignKey(
        Perfil,
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='perfil_instrumentos',
    )
    instrumento = models.ForeignKey(
        'catalogo.Instrumento',
        on_delete=models.CASCADE,
        db_column='instrumento_id',
        related_name='perfil_instrumentos',
    )

    class Meta:
        db_table = 'perfil_instrumento'
        managed = True
        unique_together = (('perfil', 'instrumento'),)
        verbose_name = 'Perfil-Instrumento'
        verbose_name_plural = 'Perfiles-Instrumentos'

    def __str__(self):
        return f'{self.perfil_id} - {self.instrumento_id}'