from django.urls import path
from .views import ComentarioViewSet

urlpatterns = [
    path('', ComentarioViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/perfil', ComentarioViewSet.as_view({'get': 'by_perfil'})),
    path('/anuncio', ComentarioViewSet.as_view({'get': 'by_anuncio'})),
    path('/<int:pk>', ComentarioViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'delete': 'destroy',
    })),
]