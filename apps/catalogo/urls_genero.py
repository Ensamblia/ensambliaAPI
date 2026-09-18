from django.urls import path
from .views import GeneroMusicalViewSet

urlpatterns = [
    path('', GeneroMusicalViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:pk>', GeneroMusicalViewSet.as_view({
        'get': 'retrieve', 'put': 'update','delete': 'destroy',
    })),
]