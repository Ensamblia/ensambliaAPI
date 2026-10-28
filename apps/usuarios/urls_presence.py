from django.urls import path
from .views import PresenceOfflineView

urlpatterns = [
    path('offline/', PresenceOfflineView.as_view(), name='presence-offline'),
]