from django.contrib import admin
from .models import (
    Comarca, Ciudad, Instrumento, GeneroMusical, Grupo, GrupoGenero, TipoArchivo,
)


@admin.register(Comarca)
class ComarcaAdmin(admin.ModelAdmin):
    list_display = ('comarca_id', 'nombre')
    search_fields = ('nombre',)


@admin.register(Ciudad)
class CiudadAdmin(admin.ModelAdmin):
    list_display = ('ciudad_id', 'nombre', 'comarca')
    search_fields = ('nombre',)


@admin.register(Instrumento)
class InstrumentoAdmin(admin.ModelAdmin):
    list_display = ('instrumento_id', 'nombre')
    search_fields = ('nombre',)


@admin.register(GeneroMusical)
class GeneroMusicalAdmin(admin.ModelAdmin):
    list_display = ('genero_musical_id', 'nombre')
    search_fields = ('nombre',)


@admin.register(Grupo)
class GrupoAdmin(admin.ModelAdmin):
    list_display = ('grupo_id', 'nombre', 'creador_perfil')
    search_fields = ('nombre',)


@admin.register(GrupoGenero)
class GrupoGeneroAdmin(admin.ModelAdmin):
    list_display = ('grupo', 'genero')


@admin.register(TipoArchivo)
class TipoArchivoAdmin(admin.ModelAdmin):
    list_display = ('tipo_archivo_id', 'nombre', 'extension', 'mime_type')