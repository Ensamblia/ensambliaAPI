from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.usuarios.pagination import StandardLimitOffsetPagination
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status

from apps.usuarios.mixins import MiPerfilMixin

from .stats import get_stats
from .serializers import StatsSerializer

from .models import Usuario
from .serializers import UsuarioSerializer
from .permissions import EsAdmin

from .presence import mark_offline

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

class StatsView(APIView):
    """
    GET /api/stats/
    Estadísticas públicas para el landing (cacheadas 5 min).
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        data = get_stats()
        return Response(StatsSerializer(data).data, status=status.HTTP_200_OK)

class PresenceOfflineView(APIView, MiPerfilMixin):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        perfil_id = self.get_mi_perfil_id(request)
        if perfil_id:
            mark_offline(perfil_id)
        return Response({'ok': True}, status=status.HTTP_200_OK)