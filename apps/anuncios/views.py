from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.usuarios.pagination import StandardLimitOffsetPagination

from apps.usuarios.mixins import MiPerfilMixin
from .models import TipoAnuncio, Anuncio, Comentario
from .serializers import (
    TipoAnuncioSerializer, TipoAnuncioCreateSerializer,
    AnuncioSerializer, AnuncioCreateSerializer, AnuncioUpdateSerializer,
    ComentarioSerializer, ComentarioCreateSerializer, ComentarioUpdateSerializer,
)


# ==================================================================
# TIPO ANUNCIO
# ==================================================================
class TipoAnuncioViewSet(viewsets.ModelViewSet):
    queryset = TipoAnuncio.objects.all()
    serializer_class = TipoAnuncioSerializer
    lookup_field = 'pk'
    permission_classes = [AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'tipo_anuncio_id']
    ordering = ['nombre']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(TipoAnuncioSerializer(qs, many=True).data)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            obj = TipoAnuncio.objects.get(pk=pk)
        except TipoAnuncio.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(TipoAnuncioSerializer(obj).data)

    def create(self, request, *args, **kwargs):
        serializer = TipoAnuncioCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(TipoAnuncioSerializer(obj).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None, *args, **kwargs):
        try:
            obj = TipoAnuncio.objects.get(pk=pk)
        except TipoAnuncio.DoesNotExist:
            return Response({'error': 'Tipo_anuncio not found'}, status=status.HTTP_404_NOT_FOUND)

        if not request.data.get('tipo') or not request.data['tipo'].strip():
            return Response(
                {'error': 'Tipo is a mandatory field. Cannot be undefined or null'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = TipoAnuncioCreateSerializer(obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(TipoAnuncioSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            obj = TipoAnuncio.objects.get(pk=pk)
        except TipoAnuncio.DoesNotExist:
            return Response({'error': 'Tipo_anuncio not found'}, status=status.HTTP_404_NOT_FOUND)
        data = TipoAnuncioSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)


# ==================================================================
# ANUNCIO
# ==================================================================
class AnuncioViewSet(viewsets.ModelViewSet, MiPerfilMixin):
    queryset = Anuncio.objects.all()
    serializer_class = AnuncioSerializer
    lookup_field = 'pk'
    permission_classes = [AllowAny]

    # ── Paginación ──────────────────────────────────────
    pagination_class = StandardLimitOffsetPagination

    # ── Filtros / Búsqueda / Ordenación ─────────────────
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'perfil': ['exact'],
        'tipo_anuncio': ['exact'],
        'fecha_publicacion': ['gte', 'lte'],
    }
    search_fields = ['titulo', 'contenido']
    ordering_fields = ['fecha_publicacion', 'titulo', 'anuncio_id']
    ordering = ['-fecha_publicacion']  # por defecto

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        # Aplicamos filtros, búsqueda y ordenación
        queryset = self.filter_queryset(self.get_queryset())

        # Paginamos
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # Si no hay paginación (no debería pasar), devolvemos todo
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==================================================================
# COMENTARIO
# ==================================================================
class ComentarioViewSet(viewsets.ModelViewSet, MiPerfilMixin):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer
    lookup_field = 'pk'
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'by_perfil', 'by_anuncio'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(ComentarioSerializer(qs, many=True).data)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            obj = Comentario.objects.get(pk=pk)
        except Comentario.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ComentarioSerializer(obj).data)

    def by_perfil(self, request):
        perfil_id = request.query_params.get('perfil_id')
        qs = Comentario.objects.filter(perfil_id=perfil_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(ComentarioSerializer(qs, many=True).data)

    def by_anuncio(self, request):
        anuncio_id = request.query_params.get('anuncio_id')
        qs = Comentario.objects.filter(anuncio_id=anuncio_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(ComentarioSerializer(qs, many=True).data)

    def create(self, request, *args, **kwargs):
        contenido = request.data.get('contenido')
        if not contenido or not str(contenido).strip():
            return Response(
                {'error': 'contenido is a mandatory field. Cannot be undefined or null'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        anuncio_id = request.data.get('anuncio_id')
        if anuncio_id is not None and not isinstance(anuncio_id, int):
            return Response(
                {'error': 'anuncio_id must be integer'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        perfil_id = self.get_mi_perfil_id(request)
        if not perfil_id:
            return Response(
                {'error': 'Necesitas crear tu perfil antes de comentar'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ComentarioCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comentario = serializer.save(perfil_id=perfil_id)
        return Response(ComentarioSerializer(comentario).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None, *args, **kwargs):
        try:
            obj = Comentario.objects.get(pk=pk)
        except Comentario.DoesNotExist:
            return Response({'error': 'comentario not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if obj.perfil_id != mi_perfil_id:
            return Response(
                {'error': 'No puedes editar el comentario de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ComentarioUpdateSerializer(obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ComentarioSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            obj = Comentario.objects.get(pk=pk)
        except Comentario.DoesNotExist:
            return Response({'error': 'Comentario not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if obj.perfil_id != mi_perfil_id:
            return Response(
                {'error': 'No puedes borrar el comentario de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = ComentarioSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)