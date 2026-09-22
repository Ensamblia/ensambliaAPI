from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError


@database_sync_to_async
def get_usuario_from_token(token_str):
    Usuario = get_user_model()
    try:
        token = AccessToken(token_str)
        usuario_id = token['usuario_id']
        return Usuario.objects.get(usuario_id=usuario_id)
    except (TokenError, KeyError, Usuario.DoesNotExist):
        return AnonymousUser()


@database_sync_to_async
def get_perfil_de_usuario(usuario_id):
    from apps.perfiles.models import Perfil
    return Perfil.objects.filter(usuario_id=usuario_id).first()


class JwtAuthMiddleware(BaseMiddleware):
    """
    Middleware ASGI que autentica el WebSocket usando el token JWT
    pasado como query string: ?token=<JWT>
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]

        scope['user'] = AnonymousUser()
        scope['perfil_id'] = None

        if token:
            usuario = await get_usuario_from_token(token)
            scope['user'] = usuario
            if usuario.is_authenticated:
                perfil = await get_perfil_de_usuario(usuario.usuario_id)
                scope['perfil_id'] = perfil.perfil_id if perfil else None

        return await super().__call__(scope, receive, send)