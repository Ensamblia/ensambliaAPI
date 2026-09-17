from django.urls import path
from .views import MultimediaViewSet

urlpatterns = [
    path('', MultimediaViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/perfil', MultimediaViewSet.as_view({'get': 'by_perfil'})),
    path('/anuncio', MultimediaViewSet.as_view({'get': 'by_anuncio'})),
    path('/<int:pk>', MultimediaViewSet.as_view({
        'get': 'retrieve', 'put': 'update',  'delete': 'destroy',
    })),
]