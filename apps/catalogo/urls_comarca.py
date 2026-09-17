from django.urls import path
from .views import ComarcaViewSet

urlpatterns = [
    path('', ComarcaViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:pk>', ComarcaViewSet.as_view({
        'get': 'retrieve', 'put': 'update','delete': 'destroy',
    })),
]