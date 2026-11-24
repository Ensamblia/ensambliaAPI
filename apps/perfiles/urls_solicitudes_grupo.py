from django.urls import path
from .views import SolicitudGrupoViewSet

urlpatterns = [
    path('', SolicitudGrupoViewSet.as_view({'get': 'list', 'post': 'create'}), name='solicitud-list'),
    path('<int:pk>/', SolicitudGrupoViewSet.as_view({'delete': 'destroy'}), name='solicitud-cancelar'),
    path('<int:pk>/aprobar/', SolicitudGrupoViewSet.as_view({'post': 'aprobar'}), name='solicitud-aprobar'),
    path('<int:pk>/rechazar/', SolicitudGrupoViewSet.as_view({'post': 'rechazar'}), name='solicitud-rechazar'),
]