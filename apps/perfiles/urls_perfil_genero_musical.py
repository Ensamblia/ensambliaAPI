from django.urls import path
from .views import PerfilGeneroMusicalViewSet


urlpatterns = [
    path('', PerfilGeneroMusicalViewSet.as_view({'get': 'list', 'post': 'create'}), name='pgm-list'),
    path('/perfil', PerfilGeneroMusicalViewSet.as_view({'get': 'by_perfil'}), name='pgm-by-perfil'),
    path('/genero', PerfilGeneroMusicalViewSet.as_view({'get': 'by_genero'}), name='pgm-by-genero'),
    path('/<int:perfil_id>/<int:genero_id>', PerfilGeneroMusicalViewSet.as_view({
        'get': 'retrieve', 'delete': 'destroy',
    }), name='pgm-detail'),
]