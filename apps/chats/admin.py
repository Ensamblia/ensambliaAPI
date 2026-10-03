from django.contrib import admin
from .models import Chat, Mensaje, MensajeLeido, MensajeAdjunto


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('chat_id',)


@admin.register(Mensaje)
class MensajeAdmin(admin.ModelAdmin):
    list_display = ('mensaje_id', 'chat', 'perfil', 'fecha_envio', 'esta_eliminado')
    list_filter = ('esta_eliminado',)


@admin.register(MensajeLeido)
class MensajeLeidoAdmin(admin.ModelAdmin):
    list_display = ('mensaje', 'perfil', 'leido_en')


@admin.register(MensajeAdjunto)
class MensajeAdjuntoAdmin(admin.ModelAdmin):
    list_display = ('adjunto_id', 'nombre', 'perfil', 'mensaje', 'tamano_bytes', 'fecha_subida')
    list_filter = ('content_type',)
    search_fields = ('nombre',)