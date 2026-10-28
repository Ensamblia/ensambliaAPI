from django.urls import path
from .views import LocalDetailView


urlpatterns = [
    path('<int:pk>/', LocalDetailView.as_view(), name='local-detail'),
]
