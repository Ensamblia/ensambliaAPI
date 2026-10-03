from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.usuarios.mixins_pagination import PaginationMixin
from apps.usuarios.mixins import MiPerfilMixin
from apps.usuarios.pagination import StandardLimitOffsetPagination
from apps.anuncios.models import Anuncio
from apps.catalogo.models import TipoArchivo
from apps.chats.utils import validar_archivo
from .models import Multimedia
from .serializers import (
    MultimediaSerializer, MultimediaCreateSerializer, MultimediaUpdateSerializer,
)


class MultimediaViewSet(PaginationMixin, viewsets.ViewSet, MiPerfilMixin):
    permission_classes = [AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre']
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

    def _get_tipo_from_content_type(self, content_type):
        """Busca o crea un TipoArchivo a partir del MIME type."""
        if not content_type:
            return None
        tipo = TipoArchivo.objects.filter(mime_type=content_type).first()
        return tipo

    # ============================================================
    # LIST
    # ============================================================
    def list(self, request):
        queryset = self._aplicar_filtros(Multimedia.objects.all())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = MultimediaSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = MultimediaSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ============================================================
    # RETRIEVE
    # ============================================================
    def retrieve(self, request, pk=None):
        try:
            obj = Multimedia.objects.get(pk=pk)
        except Multimedia.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(MultimediaSerializer(obj, context={'request': request}).data)

    # ============================================================
    # BY PERFIL
    # ============================================================
    def by_perfil(self, request):
        perfil_id = request.query_params.get('perfil_id')
        if not perfil_id:
            return Response({'error': 'perfil_id es un parámetro requerido'}, status=status.HTTP_400_BAD_REQUEST)
        qs = Multimedia.objects.filter(perfil_id=perfil_id).order_by('-fecha_subida')
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(MultimediaSerializer(qs, many=True, context={'request': request}).data)

    # ============================================================
    # BY ANUNCIO
    # ============================================================
    def by_anuncio(self, request):
        anuncio_id = request.query_params.get('anuncio_id')
        if not anuncio_id:
            return Response({'error': 'anuncio_id es un parámetro requerido'}, status=status.HTTP_400_BAD_REQUEST)
        qs = Multimedia.objects.filter(anuncio_id=anuncio_id).order_by('-fecha_subida')
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(MultimediaSerializer(qs, many=True, context={'request': request}).data)

    # ============================================================
    # PRESIGNED URL
    # ============================================================
    @action(detail=False, methods=['post'], url_path='presigned-url')
    def presigned_url(self, request):
        """
        POST /api/multimedias/presigned-url/
        Body: { nombre, content_type, tamano_bytes? }
        Respuesta: { upload_url, object_key, archivo_url }
        """
        import uuid
        import boto3
        from datetime import datetime
        from botocore.client import Config
        from django.conf import settings

        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response(
                {'error': 'Necesitas un perfil para subir archivos'},
                status=status.HTTP_403_FORBIDDEN,
            )

        nombre = request.data.get('nombre')
        content_type = request.data.get('content_type', 'application/octet-stream')
        tamano_bytes = request.data.get('tamano_bytes')

        if not nombre:
            return Response({'error': 'nombre es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        # Validación unificada (MIME + límite por tipo)
        ok, resultado = validar_archivo(nombre, content_type, tamano_bytes)
        if not ok:
            return Response({'error': resultado}, status=status.HTTP_400_BAD_REQUEST)
        content_type = resultado  # content_type normalizado

        extension = nombre.rsplit('.', 1)[-1] if '.' in nombre else 'bin'
        now = datetime.now()
        object_key = f'multimedia/{now.year}/{now.month:02d}/{uuid.uuid4()}.{extension}'

        s3_client = boto3.client(
            's3',
            endpoint_url=settings.MINIO_ENDPOINT,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1',
        )

        try:
            upload_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': settings.MINIO_BUCKET_NAME,
                    'Key': object_key,
                    'ContentType': content_type,
                },
                ExpiresIn=3600,
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        archivo_url = f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET_NAME}/{object_key}"

        return Response({
            'upload_url': upload_url,
            'object_key': object_key,
            'archivo_url': archivo_url,
        }, status=status.HTTP_200_OK)

    # ============================================================
    # CREATE (tras subir a MinIO)
    # ============================================================
    def create(self, request):
        data = request.data.copy()

        nombre = data.get('nombre')
        if not nombre or not str(nombre).strip():
            return Response({'error': 'nombre es un campo obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        archivo = data.get('archivo')
        if not archivo:
            return Response({'error': 'archivo es un campo obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        perfil_id = self.get_mi_perfil_id(request)
        if not perfil_id:
            return Response(
                {'error': 'Necesitas crear tu perfil antes de subir un archivo'},
                status=status.HTTP_403_FORBIDDEN,
            )

        anuncio_id = data.get('anuncio_id')
        if anuncio_id is not None:
            try:
                anuncio = Anuncio.objects.filter(pk=anuncio_id).first()
            except (ValueError, TypeError):
                return Response({'error': 'anuncio_id inválido'}, status=status.HTTP_400_BAD_REQUEST)
            if not anuncio:
                return Response({'error': f'Anuncio no encontrado: {anuncio_id}'}, status=status.HTTP_404_NOT_FOUND)
            if anuncio.perfil_id != perfil_id:
                return Response(
                    {'error': 'No puedes subir un archivo al anuncio de otro usuario'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        content_type = data.get('content_type')
        tipo = self._get_tipo_from_content_type(content_type)

        serializer = MultimediaCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(perfil_id=perfil_id, tipo=tipo)
        return Response(
            MultimediaSerializer(obj, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    # ============================================================
    # UPDATE
    # ============================================================
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

        if 'nombre' in data and (not isinstance(data['nombre'], str) or not data['nombre'].strip()):
            return Response({'error': 'nombre no puede estar vacío'}, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(
            MultimediaSerializer(obj, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    # ============================================================
    # DELETE
    # ============================================================
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

        data = MultimediaSerializer(obj, context={'request': request}).data
        # Ya NO borramos el archivo manualmente: la señal post_delete se encarga.
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)