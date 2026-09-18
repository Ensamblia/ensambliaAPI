from django.urls import path
from .views import PerfilViewSet


urlpatterns = [
    path('', PerfilViewSet.as_view({'get': 'list', 'post': 'create'}), name='perfil-list'),
    path('/usuario', PerfilViewSet.as_view({'get': 'get_by_usuario'}), name='perfil-usuario'),
    path('/comarca', PerfilViewSet.as_view({'get': 'get_by_comarca'}), name='perfil-comarca'),
    path('/me', PerfilViewSet.as_view({'get': 'me'}), name='perfil-me'),
    path('/<int:pk>', PerfilViewSet.as_view({
        'get': 'retrieve', 'put': 'update',  'delete': 'destroy',
    }), name='perfil-detail'),
]