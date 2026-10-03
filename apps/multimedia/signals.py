from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Multimedia


@receiver(post_delete, sender=Multimedia)
def borrar_archivo_multimedia(sender, instance, **kwargs):
    """
    Al borrar un Multimedia, borra también su archivo en MinIO.
    """
    if instance.archivo:
        try:
            instance.archivo.delete(save=False)
        except Exception:
            pass