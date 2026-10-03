from django.urls import path
from .views import MultimediaViewSet

urlpatterns = [
    path('', MultimediaViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('presigned-url/', MultimediaViewSet.as_view({'post': 'presigned_url'})),
    path('perfil/', MultimediaViewSet.as_view({'get': 'by_perfil'})),
    path('anuncio/', MultimediaViewSet.as_view({'get': 'by_anuncio'})),
    path('<int:pk>/', MultimediaViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'delete': 'destroy',
    })),
]