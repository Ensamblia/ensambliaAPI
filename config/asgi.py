import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# ⚠️ IMPORTANTE: django_asgi_app se importa ANTES de importar nada de las apps
django_asgi_app = get_asgi_application()

# Ahora sí, importamos las apps (ya están cargadas)
from apps.chats.routing import websocket_urlpatterns  # noqa: E402
from apps.usuarios.ws_auth import JwtAuthMiddleware   # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JwtAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})