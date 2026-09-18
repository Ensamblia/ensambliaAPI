from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    Comarca, Ciudad, Instrumento, GeneroMusical, Grupo, GrupoGenero, TipoArchivo,
)
from .serializers import (
    ComarcaSerializer, CiudadSerializer, InstrumentoSerializer,
    GeneroMusicalSerializer, GrupoSerializer, GrupoGeneroSerializer,
    TipoArchivoSerializer, GrupoCreateSerializer, CiudadCreateSerializer
)


class BaseCRUDViewSet(viewsets.ModelViewSet):
    """
    ViewSet base que:
    - Devuelve [] con 200 en lugar de 404 cuando la lista está vacía (fix del bug de Node)
    - Devuelve 404 con {error: "..."} idéntico a Node cuando no encuentra
    - Devuelve 201 en update (como Node)
    - Permite GET público y el resto autenticado
    """
    permission_classes = [AllowAny]

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

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return Response(
                {'error': f'Nothing found for id: {kwargs.get(self.lookup_field, kwargs.get("pk"))}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return Response(
                {'error': f'{self.queryset.model.__name__} not found'},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = self.get_serializer(instance).data
        instance.delete()
        return Response(data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        try:
            instance = self.get_object()
        except Exception:
            return Response(
                {'error': f'{self.queryset.model.__name__} not found'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ================================================================
# ViewSets concretos — cada uno son 4 líneas
# ================================================================

class ComarcaViewSet(BaseCRUDViewSet):
    queryset = Comarca.objects.all()
    serializer_class = ComarcaSerializer
    lookup_field = 'pk'

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'comarca_id']
    ordering = ['nombre']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(self.get_serializer(queryset, many=True).data)


class CiudadViewSet(BaseCRUDViewSet):
    queryset = Ciudad.objects.all()
    serializer_class = CiudadSerializer
    lookup_field = 'pk'

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre']
    ordering = ['nombre']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(self.get_serializer(queryset, many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = CiudadCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(CiudadSerializer(obj).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        try:
            obj = self.get_object()
        except Exception:
            return Response({'error': 'Ciudad not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CiudadCreateSerializer(obj, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CiudadSerializer(obj).data, status=status.HTTP_201_CREATED)


class InstrumentoViewSet(BaseCRUDViewSet):
    queryset = Instrumento.objects.all()
    serializer_class = InstrumentoSerializer
    lookup_field = 'pk'

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre']
    ordering = ['nombre']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(self.get_serializer(queryset, many=True).data)


class GeneroMusicalViewSet(BaseCRUDViewSet):
    queryset = GeneroMusical.objects.all()
    serializer_class = GeneroMusicalSerializer
    lookup_field = 'pk'

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre']
    ordering = ['nombre']
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(self.get_serializer(queryset, many=True).data)


class GrupoViewSet(BaseCRUDViewSet):
    queryset = Grupo.objects.all()
    serializer_class = GrupoSerializer
    lookup_field = 'pk'

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre']
    ordering = ['nombre']
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(self.get_serializer(queryset, many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = GrupoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(GrupoSerializer(obj).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        try:
            obj = self.get_object()
        except Exception:
            return Response({'error': 'Grupo not found'}, status=status.HTTP_404_NOT_FOUND)

        payload = request.data or {}
        allowed = {'nombre', 'descripcion'}
        if not any(k in allowed for k in payload.keys()):
            return Response(
                {'error': 'Debe enviar al menos un campo válido para actualizar'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if 'nombre' in payload and (not isinstance(payload['nombre'], str) or not payload['nombre'].strip()):
            return Response({'error': 'nombre no puede estar vacío'}, status=status.HTTP_400_BAD_REQUEST)

        if 'descripcion' in payload and payload['descripcion'] is not None and not isinstance(payload['descripcion'], str):
            return Response({'error': 'descripcion debe ser un texto'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = GrupoCreateSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(GrupoSerializer(obj).data, status=status.HTTP_200_OK)


class TipoArchivoViewSet(BaseCRUDViewSet):
    queryset = TipoArchivo.objects.all()
    serializer_class = TipoArchivoSerializer
    lookup_field = 'pk'

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nombre', 'extension', 'mime_type']
    ordering_fields = ['nombre']
    ordering = ['nombre']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(self.get_serializer(queryset, many=True).data)


# ================================================================
# GrupoGenero (pivote con PK compuesta) — se maneja aparte
# ================================================================

class GrupoGeneroViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    ordering_fields = ['grupo_id', 'genero_id']
    ordering = ['nombre']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(self.get_serializer(queryset, many=True).data)

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def retrieve(self, request, grupo_id=None, genero_id=None):
        try:
            obj = GrupoGenero.objects.get(grupo_id=grupo_id, genero_id=genero_id)
        except GrupoGenero.DoesNotExist:
            return Response(
                {'error': f'Nothing found for grupo_id: {grupo_id} and genero_id: {genero_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(GrupoGeneroSerializer(obj).data)

    def create(self, request):
        grupo_id = request.data.get('grupo_id')
        genero_id = request.data.get('genero_id')

        if not isinstance(grupo_id, int):
            return Response(
                {'error': 'grupo_id es un campo obligatorio y debe ser un entero'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not isinstance(genero_id, int):
            return Response(
                {'error': 'genero_id es un campo obligatorio y debe ser un entero'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not Grupo.objects.filter(pk=grupo_id).exists():
            return Response({'error': f'Grupo no encontrado: {grupo_id}'}, status=status.HTTP_404_NOT_FOUND)
        if not GeneroMusical.objects.filter(pk=genero_id).exists():
            return Response({'error': f'Genero no encontrado: {genero_id}'}, status=status.HTTP_404_NOT_FOUND)

        obj, _ = GrupoGenero.objects.get_or_create(grupo_id=grupo_id, genero_id=genero_id)
        return Response(GrupoGeneroSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, grupo_id=None, genero_id=None):
        try:
            obj = GrupoGenero.objects.get(grupo_id=grupo_id, genero_id=genero_id)
        except GrupoGenero.DoesNotExist:
            return Response({'error': 'Grupo_genero no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        data = GrupoGeneroSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)