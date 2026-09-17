from django.urls import path
from .views import GrupoViewSet

urlpatterns = [
    path('', GrupoViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:pk>', GrupoViewSet.as_view({
        'get': 'retrieve', 'put': 'update','delete': 'destroy',
    })),
]