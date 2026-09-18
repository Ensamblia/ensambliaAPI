from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.usuarios.mixins_pagination import PaginationMixin
from apps.usuarios.mixins import MiPerfilMixin
from apps.anuncios.models import Anuncio
from .models import Multimedia
from .serializers import (
    MultimediaSerializer, MultimediaCreateSerializer, MultimediaUpdateSerializer,
)

from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.usuarios.pagination import StandardLimitOffsetPagination


class MultimediaViewSet(PaginationMixin, viewsets.ViewSet, MiPerfilMixin):
    permission_classes = [AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre', 'ruta_archivo']
    ordering_fields = ['fecha_subida', 'nombre', 'multimedia_id']
    ordering = ['-fecha_subida']

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'by_perfil', 'by_anuncio'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def _aplicar_filtros(self, queryset):
        for backend in self.filter_backends:
            queryset = backend().filter_queryset(self.request, queryset, self)
        return queryset

    def list(self, request):
        queryset = self._aplicar_filtros(Multimedia.objects.all())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = MultimediaSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = MultimediaSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def retrieve(self, request, pk=None):
        try:
            obj = Multimedia.objects.get(pk=pk)
        except Multimedia.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(MultimediaSerializer(obj).data)

    def by_perfil(self, request):
        perfil_id = request.query_params.get('perfil_id')
        if not perfil_id:
            return Response({'error': 'perfil_id es un parámetro requerido'}, status=status.HTTP_400_BAD_REQUEST)
        qs = Multimedia.objects.filter(perfil_id=perfil_id).order_by('-fecha_subida')
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(MultimediaSerializer(qs, many=True).data)

    def by_anuncio(self, request):
        anuncio_id = request.query_params.get('anuncio_id')
        if not anuncio_id:
            return Response({'error': 'anuncio_id es un parámetro requerido'}, status=status.HTTP_400_BAD_REQUEST)
        qs = Multimedia.objects.filter(anuncio_id=anuncio_id).order_by('-fecha_subida')
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(MultimediaSerializer(qs, many=True).data)

    def create(self, request):
        data = request.data.copy()

        # Validaciones básicas
        nombre = data.get('nombre')
        if not nombre or not str(nombre).strip():
            return Response({'error': 'nombre es un campo obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        ruta = data.get('ruta_archivo')
        if not ruta or not str(ruta).strip():
            return Response({'error': 'ruta_archivo es un campo obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        tipo_id = data.get('tipo_id')
        if tipo_id is not None and not isinstance(tipo_id, int):
            return Response({'error': 'tipo_id debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        tamano_bytes = data.get('tamano_bytes')
        if tamano_bytes is not None and not isinstance(tamano_bytes, int):
            return Response({'error': 'tamano_bytes debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        anuncio_id = data.get('anuncio_id')
        if anuncio_id is not None and not isinstance(anuncio_id, int):
            return Response({'error': 'anuncio_id debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        perfil_id = self.get_mi_perfil_id(request)
        if not perfil_id:
            return Response(
                {'error': 'Necesitas crear tu perfil antes de subir un archivo'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if anuncio_id is not None:
            anuncio = Anuncio.objects.filter(pk=anuncio_id).first()
            if not anuncio:
                return Response({'error': f'Anuncio no encontrado: {anuncio_id}'}, status=status.HTTP_404_NOT_FOUND)
            if anuncio.perfil_id != perfil_id:
                return Response(
                    {'error': 'No puedes subir un archivo al anuncio de otro usuario'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = MultimediaCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(perfil_id=perfil_id)
        return Response(MultimediaSerializer(obj).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        try:
            obj = Multimedia.objects.get(pk=pk)
        except Multimedia.DoesNotExist:
            return Response({'error': 'Multimedia not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if obj.perfil_id != mi_perfil_id:
            return Response(
                {'error': 'No puedes editar el archivo de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()

        # Validaciones
        if 'nombre' in data and (not isinstance(data['nombre'], str) or not data['nombre'].strip()):
            return Response({'error': 'nombre no puede estar vacío'}, status=status.HTTP_400_BAD_REQUEST)
        if 'ruta_archivo' in data and (not isinstance(data['ruta_archivo'], str) or not data['ruta_archivo'].strip()):
            return Response({'error': 'ruta_archivo no puede estar vacío'}, status=status.HTTP_400_BAD_REQUEST)

        for field in ['tamano_bytes', 'tipo_id', 'anuncio_id']:
            if field in data and data[field] is not None and not isinstance(data[field], int):
                return Response({'error': f'{field} debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        anuncio_id = data.get('anuncio_id')
        if anuncio_id is not None:
            anuncio = Anuncio.objects.filter(pk=anuncio_id).first()
            if not anuncio:
                return Response({'error': f'Anuncio no encontrado: {anuncio_id}'}, status=status.HTTP_404_NOT_FOUND)
            if anuncio.perfil_id != mi_perfil_id:
                return Response(
                    {'error': 'No puedes vincular tu archivo al anuncio de otro usuario'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = MultimediaUpdateSerializer(obj, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(MultimediaSerializer(obj).data, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        try:
            obj = Multimedia.objects.get(pk=pk)
        except Multimedia.DoesNotExist:
            return Response({'error': 'Multimedia not found'}, status=status.HTTP_404_NOT_FOUND)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if obj.perfil_id != mi_perfil_id:
            return Response(
                {'error': 'No puedes borrar el archivo de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = MultimediaSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)