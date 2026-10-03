from django.urls import path
from .views import AnuncioViewSet

urlpatterns = [
    path('', AnuncioViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('<int:pk>/', AnuncioViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'delete': 'destroy',
    })),
    # ── Multimedia del anuncio ──
    path('<int:pk>/multimedia/', AnuncioViewSet.as_view({
        'post': 'add_multimedia',
    })),
    path('<int:pk>/multimedia/<int:multimedia_id>/', AnuncioViewSet.as_view({
        'delete': 'remove_multimedia',
    })),
]