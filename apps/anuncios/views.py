from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

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
    lookup_field = 'tipo_anuncio_id'
    permission_classes = [AllowAny]

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
    lookup_field = 'anuncio_id'
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(AnuncioSerializer(qs, many=True).data)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            obj = Anuncio.objects.get(pk=pk)
        except Anuncio.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(AnuncioSerializer(obj).data)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # Validación básica
        titulo = data.get('titulo')
        if not titulo or not str(titulo).strip():
            return Response(
                {'error': 'Titulo is a mandatory field. Cannot be undefined or null'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tipo_anuncio_id = data.get('tipo_anuncio_id')
        if tipo_anuncio_id is not None and not isinstance(tipo_anuncio_id, int):
            return Response(
                {'error': 'tipo_anuncio_id must be integer'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        perfil_id = self.get_mi_perfil_id(request)
        if not perfil_id:
            return Response(
                {'error': 'Necesitas crear tu perfil antes de publicar un anuncio'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AnuncioCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        anuncio = serializer.save(perfil_id=perfil_id)
        return Response(AnuncioSerializer(anuncio).data, status=status.HTTP_201_CREATED)

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
        return Response(AnuncioSerializer(obj).data, status=status.HTTP_201_CREATED)

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

        data = AnuncioSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)


# ==================================================================
# COMENTARIO
# ==================================================================
class ComentarioViewSet(viewsets.ModelViewSet, MiPerfilMixin):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer
    lookup_field = 'comentario_id'
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