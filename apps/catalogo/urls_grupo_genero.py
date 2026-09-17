from django.urls import path
from .views import GrupoGeneroViewSet

urlpatterns = [
    path('', GrupoGeneroViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:grupo_id>/<int:genero_id>', GrupoGeneroViewSet.as_view({
        'get': 'retrieve', 'delete': 'destroy',
    })),
]