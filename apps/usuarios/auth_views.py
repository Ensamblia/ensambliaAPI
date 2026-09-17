from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Usuario
from .serializers import RegistroSerializer, LoginSerializer, UsuarioSerializer


def _token_for(usuario):
    """Devuelve {'token': '...'} (mismo formato que Node)."""
    refresh = RefreshToken.for_user(usuario)
    # Refrescamos claims para que el payload lleve usuario_id y usuario (nickname)
    refresh['usuario_id'] = usuario.usuario_id
    refresh['usuario'] = usuario.nickname
    refresh['is_staff'] = usuario.is_staff
    return str(refresh.access_token)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegistroSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    usuario = serializer.validated_data['usuario']
    password = serializer.validated_data['password']

    if Usuario.objects.filter(nickname=usuario).exists():
        return Response(
            {'message': 'Username in use'},
            status=status.HTTP_409_CONFLICT,
        )

    nuevo = Usuario.objects.create_user(nickname=usuario, password=password)
    token = _token_for(nuevo)

    return Response(
        {
            'message': 'New user registered',
            'usuario': UsuarioSerializer(nuevo).data,
            'token': token,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    usuario = serializer.validated_data['usuario']
    password = serializer.validated_data['password']

    user = authenticate(request, username=usuario, password=password)
    if user is None:
        return Response(
            {'mensaje': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response({'token': _token_for(user)})