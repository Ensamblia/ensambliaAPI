from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.usuarios.mixins import MiPerfilMixin
from .models import (
    Perfil, PerfilChat, PerfilGeneroMusical, PerfilGrupo, PerfilInstrumento,
)
from .serializers import (
    PerfilSerializer, PerfilCreateSerializer, PerfilUpdateSerializer,
    PerfilChatSerializer, PerfilGeneroMusicalSerializer,
    PerfilGrupoSerializer, PerfilInstrumentoSerializer,
)


class PerfilViewSet(viewsets.ModelViewSet, MiPerfilMixin):
    """
    - GET    /api/perfiles                        → lista (público)
    - GET    /api/perfiles/usuario?usuario_id=1   → por usuario
    - GET    /api/perfiles/comarca?comarca_id=1   → por comarca
    - GET    /api/perfiles/me                     → mi perfil (auth)
    - GET    /api/perfiles/:id                    → detalle (público)
    - POST   /api/perfiles                        → crear (auth)
    - PUT    /api/perfiles/:id                    → editar (auth, solo mío)
    - DELETE /api/perfiles/:id                    → borrar (auth, solo mío)
    """
    queryset = Perfil.objects.all()
    serializer_class = PerfilSerializer
    lookup_field = 'perfil_id'
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'get_by_usuario', 'get_by_comarca'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilSerializer(qs, many=True).data)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            obj = Perfil.objects.get(pk=pk)
        except Perfil.DoesNotExist:
            return Response(
                {'error': f'Nothing found for id: {pk}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PerfilSerializer(obj).data)

    @action(detail=False, methods=['get'], url_path='usuario')
    def get_by_usuario(self, request):
        usuario_id = request.query_params.get('usuario_id')
        qs = Perfil.objects.filter(usuario_id=usuario_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='comarca')
    def get_by_comarca(self, request):
        comarca_id = request.query_params.get('comarca_id')
        qs = Perfil.objects.filter(comarca_id=comarca_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        usuario_id = request.user.usuario_id
        qs = Perfil.objects.filter(usuario_id=usuario_id)
        if not qs.exists():
            return Response(
                {'error': 'Todavía no has creado tu perfil'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PerfilSerializer(qs.first()).data)

    def create(self, request, *args, **kwargs):
        serializer = PerfilCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        perfil = serializer.save(usuario_id=request.user.usuario_id)
        return Response(PerfilSerializer(perfil).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        try:
            obj = Perfil.objects.get(pk=pk)
        except Perfil.DoesNotExist:
            return Response({'error': 'Perfil not found'}, status=status.HTTP_404_NOT_FOUND)

        if obj.usuario_id != request.user.usuario_id:
            return Response(
            {'error': 'No puedes editar el perfil de otro usuario'},
            status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PerfilUpdateSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PerfilSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        try:
            obj = Perfil.objects.get(pk=pk)
        except Perfil.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if obj.usuario_id != request.user.usuario_id:
            return Response(
                {'error': 'No puedes borrar el perfil de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = PerfilSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)


class PerfilChatViewSet(viewsets.ViewSet, MiPerfilMixin):
    """
    Endpoints custom para la tabla pivote perfil_chat.
    Los definimos aparte porque el front Node usa paths específicos.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """
        GET /api/perfil-chats
        Solo muestra los perfil_chat de los chats en los que YO participo.
        """
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response([], status=status.HTTP_200_OK)

        mis_chats = PerfilChat.objects.filter(perfil_id=mi_perfil_id).values_list('chat_id', flat=True)
        qs = PerfilChat.objects.filter(chat_id__in=list(mis_chats))
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilChatSerializer(qs, many=True).data)

    def retrieve(self, request, perfil_id=None, chat_id=None):
        """
        GET /api/perfil-chats/:perfil_id/:chat_id
        Solo si participo en el chat.
        """
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id:
            return Response({'error': 'No participas en este chat'}, status=status.HTTP_403_FORBIDDEN)

        if int(perfil_id) != mi_perfil_id:
            participantes = PerfilChat.objects.filter(chat_id=chat_id)
            if not any(p.perfil_id == mi_perfil_id for p in participantes):
                return Response({'error': 'No participas en este chat'}, status=status.HTTP_403_FORBIDDEN)

        try:
            obj = PerfilChat.objects.get(perfil_id=perfil_id, chat_id=chat_id)
        except PerfilChat.DoesNotExist:
            return Response(
                {'error': f'Nothing found for perfil_id: {perfil_id} and chat_id: {chat_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PerfilChatSerializer(obj).data)

    def create(self, request):
        """
        POST /api/perfil-chats
        Solo puedo añadirme a mí mismo.
        """
        perfil_id = request.data.get('perfil_id')
        chat_id = request.data.get('chat_id')

        if not isinstance(perfil_id, int):
            return Response({'error': 'perfil_id es un campo obligatorio y debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(chat_id, int):
            return Response({'error': 'chat_id es un campo obligatorio y debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        mi_perfil_id = self.get_mi_perfil_id(request)
        if perfil_id != mi_perfil_id:
            return Response({'error': 'No puedes añadir a otro perfil a un chat'}, status=status.HTTP_403_FORBIDDEN)

        obj, _ = PerfilChat.objects.get_or_create(perfil_id=perfil_id, chat_id=chat_id)
        return Response(PerfilChatSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, perfil_id=None, chat_id=None):
        """
        DELETE /api/perfil-chats/:perfil_id/:chat_id
        Solo puedo sacarme a mí mismo.
        """
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id or int(perfil_id) != mi_perfil_id:
            return Response({'error': 'No puedes sacar a otro perfil de un chat'}, status=status.HTTP_403_FORBIDDEN)

        try:
            obj = PerfilChat.objects.get(perfil_id=perfil_id, chat_id=chat_id)
        except PerfilChat.DoesNotExist:
            return Response({'error': 'Perfil_chat no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        data = PerfilChatSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)

    def by_perfil(self, request):
        perfil_id = request.query_params.get('perfil_id')
        mi_perfil_id = self.get_mi_perfil_id(request)
        if not mi_perfil_id or int(perfil_id) != mi_perfil_id:
            return Response({'error': 'No puedes ver los chats de otro perfil'}, status=status.HTTP_403_FORBIDDEN)
        qs = PerfilChat.objects.filter(perfil_id=perfil_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilChatSerializer(qs, many=True).data)

    def by_chat(self, request):
        chat_id = request.query_params.get('chat_id')
        mi_perfil_id = self.get_mi_perfil_id(request)
        participantes = PerfilChat.objects.filter(chat_id=chat_id)
        if not mi_perfil_id or not any(p.perfil_id == mi_perfil_id for p in participantes):
            return Response({'error': 'No participas en este chat'}, status=status.HTTP_403_FORBIDDEN)
        if not participantes.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilChatSerializer(participantes, many=True).data)


class PerfilGeneroMusicalViewSet(viewsets.ViewSet, MiPerfilMixin):
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'get_by_perfil', 'get_by_genero'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        qs = PerfilGeneroMusical.objects.all().order_by('perfil_id', 'genero_id')
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilGeneroMusicalSerializer(qs, many=True).data)

    def retrieve(self, request, perfil_id=None, genero_id=None):
        try:
            obj = PerfilGeneroMusical.objects.get(perfil_id=perfil_id, genero_id=genero_id)
        except PerfilGeneroMusical.DoesNotExist:
            return Response(
                {'error': f'Nothing found for perfil_id: {perfil_id} and genero_id: {genero_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PerfilGeneroMusicalSerializer(obj).data)

    def create(self, request):
        perfil_id = request.data.get('perfil_id')
        genero_id = request.data.get('genero_id')

        if not isinstance(perfil_id, int):
            return Response({'error': 'perfil_id es un campo obligatorio y debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(genero_id, int):
            return Response({'error': 'genero_id es un campo obligatorio y debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        perfil = Perfil.objects.filter(pk=perfil_id).first()
        if not perfil:
            return Response({'error': f'Perfil no encontrado: {perfil_id}'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario_id != request.user.usuario_id:
            return Response({'error': 'No puedes modificar el perfil de otro usuario'}, status=status.HTTP_403_FORBIDDEN)

        obj, _ = PerfilGeneroMusical.objects.get_or_create(perfil_id=perfil_id, genero_id=genero_id)
        return Response(PerfilGeneroMusicalSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, perfil_id=None, genero_id=None):
        perfil = Perfil.objects.filter(pk=perfil_id).first()
        if not perfil:
            return Response({'error': f'Perfil no encontrado: {perfil_id}'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario_id != request.user.usuario_id:
            return Response({'error': 'No puedes modificar el perfil de otro usuario'}, status=status.HTTP_403_FORBIDDEN)

        try:
            obj = PerfilGeneroMusical.objects.get(perfil_id=perfil_id, genero_id=genero_id)
        except PerfilGeneroMusical.DoesNotExist:
            return Response({'error': 'Perfil_genero_musical no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        data = PerfilGeneroMusicalSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)

    def by_perfil(self, request):
        perfil_id = request.query_params.get('perfil_id')
        qs = PerfilGeneroMusical.objects.filter(perfil_id=perfil_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilGeneroMusicalSerializer(qs, many=True).data)

    def by_genero(self, request):
        genero_id = request.query_params.get('genero_id')
        qs = PerfilGeneroMusical.objects.filter(genero_id=genero_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilGeneroMusicalSerializer(qs, many=True).data)


class PerfilGrupoViewSet(viewsets.ViewSet, MiPerfilMixin):
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'get_by_perfil', 'get_by_grupo'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        qs = PerfilGrupo.objects.all().order_by('perfil_id', 'grupo_id')
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilGrupoSerializer(qs, many=True).data)

    def retrieve(self, request, perfil_id=None, grupo_id=None):
        try:
            obj = PerfilGrupo.objects.get(perfil_id=perfil_id, grupo_id=grupo_id)
        except PerfilGrupo.DoesNotExist:
            return Response(
                {'error': f'Nothing found for perfil_id: {perfil_id} and grupo_id: {grupo_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PerfilGrupoSerializer(obj).data)

    def create(self, request):
        perfil_id = request.data.get('perfil_id')
        grupo_id = request.data.get('grupo_id')

        if not isinstance(perfil_id, int):
            return Response({'error': 'perfil_id es un campo obligatorio y debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(grupo_id, int):
            return Response({'error': 'grupo_id es un campo obligatorio y debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        perfil = Perfil.objects.filter(pk=perfil_id).first()
        if not perfil:
            return Response({'error': f'Perfil no encontrado: {perfil_id}'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario_id != request.user.usuario_id:
            return Response({'error': 'No puedes modificar el perfil de otro usuario'}, status=status.HTTP_403_FORBIDDEN)

        obj, _ = PerfilGrupo.objects.get_or_create(perfil_id=perfil_id, grupo_id=grupo_id)
        return Response(PerfilGrupoSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, perfil_id=None, grupo_id=None):
        perfil = Perfil.objects.filter(pk=perfil_id).first()
        if not perfil:
            return Response({'error': f'Perfil no encontrado: {perfil_id}'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario_id != request.user.usuario_id:
            return Response({'error': 'No puedes modificar el perfil de otro usuario'}, status=status.HTTP_403_FORBIDDEN)

        try:
            obj = PerfilGrupo.objects.get(perfil_id=perfil_id, grupo_id=grupo_id)
        except PerfilGrupo.DoesNotExist:
            return Response({'error': 'Perfil_grupo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        data = PerfilGrupoSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)

    def by_perfil(self, request):
        perfil_id = request.query_params.get('perfil_id')
        if not perfil_id:
            return Response({'error': 'perfil_id es un parámetro requerido'}, status=status.HTTP_400_BAD_REQUEST)
        qs = PerfilGrupo.objects.filter(perfil_id=perfil_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilGrupoSerializer(qs, many=True).data)

    def by_grupo(self, request):
        grupo_id = request.query_params.get('grupo_id')
        if not grupo_id:
            return Response({'error': 'grupo_id es un parámetro requerido'}, status=status.HTTP_400_BAD_REQUEST)
        qs = PerfilGrupo.objects.filter(grupo_id=grupo_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilGrupoSerializer(qs, many=True).data)


class PerfilInstrumentoViewSet(viewsets.ViewSet, MiPerfilMixin):
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'get_by_perfil', 'get_by_instrumento'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        qs = PerfilInstrumento.objects.all().order_by('perfil_id', 'instrumento_id')
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilInstrumentoSerializer(qs, many=True).data)

    def retrieve(self, request, perfil_id=None, instrumento_id=None):
        try:
            obj = PerfilInstrumento.objects.get(perfil_id=perfil_id, instrumento_id=instrumento_id)
        except PerfilInstrumento.DoesNotExist:
            return Response(
                {'error': f'Nothing found for perfil_id: {perfil_id} and instrumento_id: {instrumento_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PerfilInstrumentoSerializer(obj).data)

    def create(self, request):
        perfil_id = request.data.get('perfil_id')
        instrumento_id = request.data.get('instrumento_id')

        if not isinstance(perfil_id, int):
            return Response({'error': 'perfil_id es un campo obligatorio y debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(instrumento_id, int):
            return Response({'error': 'instrumento_id es un campo obligatorio y debe ser un entero'}, status=status.HTTP_400_BAD_REQUEST)

        perfil = Perfil.objects.filter(pk=perfil_id).first()
        if not perfil:
            return Response({'error': f'Perfil no encontrado: {perfil_id}'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario_id != request.user.usuario_id:
            return Response({'error': 'No puedes modificar el perfil de otro usuario'}, status=status.HTTP_403_FORBIDDEN)

        obj, _ = PerfilInstrumento.objects.get_or_create(perfil_id=perfil_id, instrumento_id=instrumento_id)
        return Response(PerfilInstrumentoSerializer(obj).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, perfil_id=None, instrumento_id=None):
        perfil = Perfil.objects.filter(pk=perfil_id).first()
        if not perfil:
            return Response({'error': f'Perfil no encontrado: {perfil_id}'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario_id != request.user.usuario_id:
            return Response({'error': 'No puedes modificar el perfil de otro usuario'}, status=status.HTTP_403_FORBIDDEN)

        try:
            obj = PerfilInstrumento.objects.get(perfil_id=perfil_id, instrumento_id=instrumento_id)
        except PerfilInstrumento.DoesNotExist:
            return Response({'error': 'Perfil_instrumento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        data = PerfilInstrumentoSerializer(obj).data
        obj.delete()
        return Response(data, status=status.HTTP_200_OK)

    def by_perfil(self, request):
        perfil_id = request.query_params.get('perfil_id')
        qs = PerfilInstrumento.objects.filter(perfil_id=perfil_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilInstrumentoSerializer(qs, many=True).data)

    def by_instrumento(self, request):
        instrumento_id = request.query_params.get('instrumento_id')
        qs = PerfilInstrumento.objects.filter(instrumento_id=instrumento_id)
        if not qs.exists():
            return Response([], status=status.HTTP_200_OK)
        return Response(PerfilInstrumentoSerializer(qs, many=True).data)