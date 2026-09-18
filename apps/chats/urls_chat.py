from django.urls import path
from .views import ChatViewSet

urlpatterns = [
    path('', ChatViewSet.as_view({'get': 'list'})),
    path('/con/<int:otro_perfil_id>', ChatViewSet.as_view({'post': 'iniciar_conversacion'})),
    path('/<int:pk>', ChatViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'})),
]