from django.contrib import admin
from .models import (
    Perfil, PerfilChat, PerfilGeneroMusical, PerfilGrupo, PerfilInstrumento,
)


@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('perfil_id', 'nombre', 'apellido', 'correo', 'usuario')
    search_fields = ('nombre', 'apellido', 'correo')


@admin.register(PerfilChat)
class PerfilChatAdmin(admin.ModelAdmin):
    list_display = ('perfil', 'chat_id', 'fecha_union')


@admin.register(PerfilGeneroMusical)
class PerfilGeneroMusicalAdmin(admin.ModelAdmin):
    list_display = ('perfil', 'genero')


@admin.register(PerfilGrupo)
class PerfilGrupoAdmin(admin.ModelAdmin):
    list_display = ('perfil', 'grupo')


@admin.register(PerfilInstrumento)
class PerfilInstrumentoAdmin(admin.ModelAdmin):
    list_display = ('perfil', 'instrumento')