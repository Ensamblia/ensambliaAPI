from django.urls import path
from .views import PerfilInstrumentoViewSet


urlpatterns = [
    path('', PerfilInstrumentoViewSet.as_view({'get': 'list', 'post': 'create'}), name='pi-list'),
    path('/perfil', PerfilInstrumentoViewSet.as_view({'get': 'by_perfil'}), name='pi-by-perfil'),
    path('/instrumento', PerfilInstrumentoViewSet.as_view({'get': 'by_instrumento'}), name='pi-by-instrumento'),
    path('/<int:perfil_id>/<int:instrumento_id>', PerfilInstrumentoViewSet.as_view({
        'get': 'retrieve', 'delete': 'destroy',
    }), name='pi-detail'),
]