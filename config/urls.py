from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Documentación
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Auth + usuarios
    path('api/auth', include('apps.usuarios.urls_auth')),
    path('api/usuarios', include('apps.usuarios.urls')),

    # Catálogo
    path('api/instrumentos', include('apps.catalogo.urls_instrumento')),
    path('api/genero_musical', include('apps.catalogo.urls_genero')),
    path('api/grupos', include('apps.catalogo.urls_grupo')),
    path('api/grupo-generos', include('apps.catalogo.urls_grupo_genero')),
    path('api/comarcas', include('apps.catalogo.urls_comarca')),
    path('api/ciudades', include('apps.catalogo.urls_ciudad')),
    path('api/tipo-archivos', include('apps.catalogo.urls_tipo_archivo')),

    # Perfiles
    path('api/perfiles', include('apps.perfiles.urls')),
    path('api/perfil-chats', include('apps.perfiles.urls_perfil_chat')),
    path('api/perfil-genero-musicales', include('apps.perfiles.urls_perfil_genero_musical')),
    path('api/perfil-grupos', include('apps.perfiles.urls_perfil_grupo')),
    path('api/perfil-instrumentos', include('apps.perfiles.urls_perfil_instrumento')),

    # Anuncios
    path('api/tipo-anuncios', include('apps.anuncios.urls_tipo_anuncio')),
    path('api/anuncios', include('apps.anuncios.urls_anuncio')),
    path('api/comentarios', include('apps.anuncios.urls_comentario')),
    path('api/chats', include('apps.chats.urls_chat')),
    path('api/mensajes', include('apps.chats.urls_mensaje')),
    path('api/mensaje-leidos', include('apps.chats.urls_mensaje_leido')),

    # Multimedia
    path('api/multimedias', include('apps.multimedia.urls')),
]