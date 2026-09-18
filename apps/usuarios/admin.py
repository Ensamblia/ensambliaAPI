from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    list_display = ('usuario_id', 'nickname', 'is_staff', 'is_active', 'creado_en')
    search_fields = ('nickname',)
    ordering = ('usuario_id',)

    fieldsets = (
        (None, {'fields': ('nickname', 'password')}),
        ('Permisos', {'fields': ('is_staff', 'is_superuser', 'is_active')}),
        ('Fechas', {'fields': ('last_login', 'creado_en')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('nickname', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )