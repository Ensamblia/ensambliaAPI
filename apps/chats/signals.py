from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import MensajeAdjunto


@receiver(post_delete, sender=MensajeAdjunto)
def borrar_archivo_adjunto(sender, instance, **kwargs):
    """
    Al borrar un MensajeAdjunto, borra también su archivo en MinIO.
    Se ejecuta tanto si se borra por cascade (mensaje/chat) como si
    se borra directamente desde admin o desde el cleanup.
    """
    if instance.archivo:
        try:
            instance.archivo.delete(save=False)
        except Exception:
            # Si MinIO no responde o el archivo ya no existe, no rompemos
            # la transacción de borrado en BD.
            pass