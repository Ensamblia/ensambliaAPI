from django.urls import path
from .views import EventoDetailView, EventoListView, MisPerfilesView


urlpatterns = [
    path('', EventoListView.as_view(), name='evento-list'),
    path('mis-perfiles/', MisPerfilesView.as_view(), name='evento-mis-perfiles'),
    path('<int:pk>/', EventoDetailView.as_view(), name='evento-detail'),
]
