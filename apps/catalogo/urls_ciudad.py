from django.urls import path
from .views import CiudadViewSet

urlpatterns = [
    path('', CiudadViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:pk>', CiudadViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'delete': 'destroy',
    })),
]