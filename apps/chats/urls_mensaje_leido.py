from django.urls import path
from .views import MensajeLeidoViewSet

urlpatterns = [
    path('', MensajeLeidoViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:mensaje_id>/<int:perfil_id>', MensajeLeidoViewSet.as_view({
        'get': 'retrieve', 'delete': 'destroy',
    })),
]