from django.contrib import admin
from .models import Multimedia


@admin.register(Multimedia)
class MultimediaAdmin(admin.ModelAdmin):
    list_display = ('multimedia_id', 'nombre', 'perfil', 'fecha_subida')
    search_fields = ('nombre',)
    list_filter = ('tipo',)