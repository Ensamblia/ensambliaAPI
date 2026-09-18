from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.usuarios.pagination import StandardLimitOffsetPagination

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

    pagination_class = StandardLimitOffsetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nickname']
    ordering_fields = ['usuario_id', 'nickname', 'creado_en']
    ordering = ['usuario_id']
