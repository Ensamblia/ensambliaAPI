from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.anuncios.models import Anuncio, Comentario
from apps.chats.models import Mensaje
from apps.perfiles.models import Perfil

from .stats import invalidate_stats_cache


@receiver([post_save, post_delete], sender=Perfil)
def _perfil_cambio(sender, **kwargs):
    invalidate_stats_cache()


@receiver([post_save, post_delete], sender=Anuncio)
def _anuncio_cambio(sender, **kwargs):
    invalidate_stats_cache()


@receiver([post_save, post_delete], sender=Mensaje)
def _mensaje_cambio(sender, **kwargs):
    invalidate_stats_cache()


@receiver([post_save, post_delete], sender=Comentario)
def _comentario_cambio(sender, **kwargs):
    invalidate_stats_cache()