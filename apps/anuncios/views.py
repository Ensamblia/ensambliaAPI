from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.usuarios.pagination import StandardLimitOffsetPagination

from apps.usuarios.mixins import MiPerfilMixin
from apps.multimedia.models import Multimedia
from .models import TipoAnuncio, Anuncio, Comentario, AnuncioMultimedia
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
        return [IsAdminUser()]

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

    pagination_class = StandardLimitOffsetPagination

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'perfil': ['exact'],
        'tipo_anuncio': ['exact'],
        'fecha_publicacion': ['gte', 'lte'],
    }
    search_fields = ['titulo', 'contenido']
    ordering_fields = ['fecha_publicacion', 'titulo', 'anuncio_id']
    ordering = ['-fecha_publicacion']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            obj = Anuncio.objects.get(pk=pk)
        except Anuncio.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(AnuncioSerializer(obj, context={'request': request}).data)

    def create(self, request, *args, **kwargs):
        titulo = request.data.get('titulo')
        if not titulo or not str(titulo).strip():
            return Response(
                {'error': 'Titulo is a mandatory field. Cannot be undefined or null'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        perfil_id = self.get_mi_perfil_id(request)
        if not perfil_id:
            return Response(
                {'error': 'Necesitas crear tu perfil antes de publicar un anuncio'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AnuncioCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        anuncio = serializer.save(perfil_id=perfil_id)
        return Response(
            AnuncioSerializer(anuncio, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, pk=None, *args, **kwargs):
        try:
            obj = Anuncio.objects.get(pk=pk)
        except Anuncio.DoesNotExist:
            return Response({'error': 'Anuncio not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if obj.perfil_id != mi_perfil_id and not request.user.is_staff:
            return Response(
                {'error': 'No puedes editar el anuncio de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AnuncioUpdateSerializer(obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            AnuncioSerializer(obj, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            obj = Anuncio.objects.get(pk=pk)
        except Anuncio.DoesNotExist:
            return Response({'error': 'Anuncio not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if obj.perfil_id != mi_perfil_id and not request.user.is_staff:
            return Response(
                {'error': 'No puedes borrar el anuncio de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = AnuncioSerializer(obj, context={'request': request}).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)

    # ============================================================
    # MULTIMEDIA DEL ANUNCIO
    # ============================================================

    @action(detail=True, methods=['post'], url_path='multimedia')
    def add_multimedia(self, request, pk=None):
        """POST /api/anuncios/:id/multimedia/ — vincula medios al anuncio."""
        try:
            anuncio = Anuncio.objects.get(pk=pk)
        except Anuncio.DoesNotExist:
            return Response({'error': 'Anuncio not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if anuncio.perfil_id != mi_perfil_id and not request.user.is_staff:
            return Response(
                {'error': 'No puedes editar el anuncio de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        multimedia_ids = request.data.get('multimedia_ids', [])
        if not isinstance(multimedia_ids, list):
            return Response(
                {'error': 'multimedia_ids debe ser una lista'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        creados = []
        for index, mid in enumerate(multimedia_ids):
            media = Multimedia.objects.filter(pk=mid, perfil_id=mi_perfil_id).first()
            if not media:
                continue
            obj, created = AnuncioMultimedia.objects.get_or_create(
                anuncio=anuncio,
                multimedia=media,
                defaults={'orden': index},
            )
            if created:
                creados.append(obj)

        return Response({
            'anuncio_id': anuncio.anuncio_id,
            'multimedia_count': anuncio.anuncio_multimedias.count(),
            'agregados': len(creados),
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='multimedia/(?P<multimedia_id>[^/.]+)')
    def remove_multimedia(self, request, pk=None, multimedia_id=None):
        """DELETE /api/anuncios/:id/multimedia/:multimedia_id/ — desvincula."""
        try:
            anuncio = Anuncio.objects.get(pk=pk)
        except Anuncio.DoesNotExist:
            return Response({'error': 'Anuncio not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if anuncio.perfil_id != mi_perfil_id and not request.user.is_staff:
            return Response(
                {'error': 'No puedes editar el anuncio de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            vinculo = AnuncioMultimedia.objects.get(
                anuncio=anuncio,
                multimedia_id=multimedia_id,
            )
        except AnuncioMultimedia.DoesNotExist:
            return Response(
                {'error': 'Multimedia no vinculada a este anuncio'},
                status=status.HTTP_404_NOT_FOUND,
            )

        vinculo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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