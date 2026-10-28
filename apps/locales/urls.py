from django.urls import path
from .views import ArtistasSugeridosView, LocalDetailView, LocalListView


urlpatterns = [
    path('', LocalListView.as_view(), name='local-list'),
    path('<int:pk>/', LocalDetailView.as_view(), name='local-detail'),
    path('<int:pk>/artistas-sugeridos/', ArtistasSugeridosView.as_view(), name='local-artistas-sugeridos'),
]
