from django.contrib import admin
from .models import TipoAnuncio, Anuncio, Comentario


@admin.register(TipoAnuncio)
class TipoAnuncioAdmin(admin.ModelAdmin):
    list_display = ('tipo_anuncio_id', 'nombre')
    search_fields = ('nombre',)


@admin.register(Anuncio)
class AnuncioAdmin(admin.ModelAdmin):
    list_display = ('anuncio_id', 'titulo', 'perfil', 'tipo_anuncio', 'fecha_publicacion')
    search_fields = ('titulo', 'contenido')
    list_filter = ('tipo_anuncio',)


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ('comentario_id', 'anuncio', 'perfil', 'fecha_publicacion', 'esta_eliminado')
    list_filter = ('esta_eliminado',)