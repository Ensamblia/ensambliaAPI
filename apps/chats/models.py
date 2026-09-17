from django.db import models


class Chat(models.Model):
    chat_id = models.BigAutoField(primary_key=True, db_column='chat_id')

    class Meta:
        db_table = 'chat'
        managed = True
        verbose_name = 'Chat'
        verbose_name_plural = 'Chats'

    def __str__(self):
        return f'Chat {self.chat_id}'


class Mensaje(models.Model):
    mensaje_id = models.BigAutoField(primary_key=True, db_column='mensaje_id')
    contenido = models.CharField(max_length=500, db_column='contenido')
    fecha_envio = models.DateTimeField(auto_now_add=True, db_column='fecha_envio')
    esta_eliminado = models.BooleanField(default=False, db_column='esta_eliminado')

    chat = models.ForeignKey(
        Chat,
        null=True, blank=True,
        on_delete=models.CASCADE,
        db_column='chat_id',
        related_name='mensajes',
    )
    perfil = models.ForeignKey(
        'perfiles.Perfil',
        null=True, blank=True,
        on_delete=models.CASCADE,
        db_column='perfil_id',
        related_name='mensajes',
    )

    class Meta:
        db_table = 'mensaje'
        managed = True
        verbose_name = 'Mensaje'
        verbose_name_plural = 'Mensajes'
        ordering = ['fecha_envio']

    def __str__(self):
        return f'Mensaje {self.mensaje_id}'


class MensajeLeido(models.Model):
    mensaje = models.ForeignKey(
        Mensaje, on_delete=models.CASCADE,
        db_column='mensaje_id', primary_key=True,
    )
    perfil = models.ForeignKey(
        'perfiles.Perfil', on_delete=models.CASCADE,
        db_column='perfil_id',
    )
    leido_en = models.DateTimeField(auto_now_add=True, db_column='leido_en')

    class Meta:
        db_table = 'mensaje_leido'
        managed = True
        unique_together = (('mensaje', 'perfil'),)
        verbose_name = 'Mensaje leído'
        verbose_name_plural = 'Mensajes leídos'

    def __str__(self):
        return f'{self.mensaje_id} - {self.perfil_id}'