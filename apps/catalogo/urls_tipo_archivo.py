from django.urls import path
from .views import TipoArchivoViewSet

urlpatterns = [
    path('', TipoArchivoViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:pk>', TipoArchivoViewSet.as_view({
        'get': 'retrieve', 'put': 'update',  'delete': 'destroy',
    })),
]