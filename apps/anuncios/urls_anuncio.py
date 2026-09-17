from django.urls import path
from .views import AnuncioViewSet

urlpatterns = [
    path('', AnuncioViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:pk>', AnuncioViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'delete': 'destroy',
    })),
]