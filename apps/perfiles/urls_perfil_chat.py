from django.urls import path
from .views import PerfilChatViewSet


urlpatterns = [
    path('', PerfilChatViewSet.as_view({'get': 'list', 'post': 'create'}), name='perfil-chat-list'),
    path('/perfil', PerfilChatViewSet.as_view({'get': 'by_perfil'}), name='perfil-chat-by-perfil'),
    path('/chat', PerfilChatViewSet.as_view({'get': 'by_chat'}), name='perfil-chat-by-chat'),
    path('/<int:perfil_id>/<int:chat_id>', PerfilChatViewSet.as_view({
        'get': 'retrieve', 'delete': 'destroy',
    }), name='perfil-chat-detail'),
]