from django.urls import path
from .views import MensajeViewSet

urlpatterns = [
    path('', MensajeViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/chat', MensajeViewSet.as_view({'get': 'by_chat'})),
    path('/perfil', MensajeViewSet.as_view({'get': 'by_perfil'})),
    path('/<int:pk>', MensajeViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'delete': 'destroy',
    })),
]