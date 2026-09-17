from django.urls import path
from .views import TipoAnuncioViewSet

urlpatterns = [
    path('', TipoAnuncioViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:pk>', TipoAnuncioViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'delete': 'destroy',
    })),
]