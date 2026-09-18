from django.urls import path
from .views import InstrumentoViewSet

urlpatterns = [
    path('', InstrumentoViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('/<int:pk>', InstrumentoViewSet.as_view({
        'get': 'retrieve', 'put': 'update',  'delete': 'destroy',
    })),
]