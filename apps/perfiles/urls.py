# apps/perfiles/urls.py
from django.urls import path
from .views import PerfilViewSet


urlpatterns = [
    path('', PerfilViewSet.as_view({'get': 'list', 'post': 'create'}), name='perfil-list'),
    path('usuario/', PerfilViewSet.as_view({'get': 'get_by_usuario'}), name='perfil-usuario'),
    path('comarca/', PerfilViewSet.as_view({'get': 'get_by_comarca'}), name='perfil-comarca'),
    path('me/', PerfilViewSet.as_view({'get': 'me'}), name='perfil-me'),

    # ── Foto de perfil (M.4) ──
    path(
        'presigned-avatar/',
        PerfilViewSet.as_view({'post': 'presigned_avatar'}),
        name='perfil-presigned-avatar',
    ),
    path(
        '<int:pk>/set-avatar/',
        PerfilViewSet.as_view({'post': 'set_avatar'}),
        name='perfil-set-avatar',
    ),
    path(
        '<int:pk>/avatar/',
        PerfilViewSet.as_view({'delete': 'delete_avatar'}),
        name='perfil-delete-avatar',
    ),

    path('<int:pk>/', PerfilViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'delete': 'destroy',
    }), name='perfil-detail'),
]