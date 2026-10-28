from django.urls import path
from .views import LocalDetailView, LocalListView


urlpatterns = [
    path('', LocalListView.as_view(), name='local-list'),
    path('<int:pk>/', LocalDetailView.as_view(), name='local-detail'),
]
