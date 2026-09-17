from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Usuario
from .serializers import UsuarioSerializer
from .permissions import EsAdmin


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    GET /api/usuarios/              → solo admin
    GET /api/usuarios/:id/          → solo admin
    PUT /api/usuarios/:id/          → solo admin
    DELETE /api/usuarios/:id/       → solo admin
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, EsAdmin]
    lookup_field = 'usuario_id'