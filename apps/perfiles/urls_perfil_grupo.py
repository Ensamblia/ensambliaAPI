from django.urls import path
from .views import PerfilGrupoViewSet


urlpatterns = [
    path('', PerfilGrupoViewSet.as_view({'get': 'list', 'post': 'create'}), name='pg-list'),
    path('/perfil', PerfilGrupoViewSet.as_view({'get': 'by_perfil'}), name='pg-by-perfil'),
    path('/grupo', PerfilGrupoViewSet.as_view({'get': 'by_grupo'}), name='pg-by-grupo'),
    path('/<int:perfil_id>/<int:grupo_id>', PerfilGrupoViewSet.as_view({
        'get': 'retrieve', 'delete': 'destroy',
    }), name='pg-detail'),
]