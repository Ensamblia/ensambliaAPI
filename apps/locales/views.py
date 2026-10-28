from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.perfiles.models import Perfil
from .models import Local
from .serializers import LocalPerfilSerializer, LocalWriteSerializer


class LocalDetailView(APIView):
    """
    - GET /api/locales/:perfil_id  → perfil local + datos del local (público)
    - PUT /api/locales/:perfil_id  → crea o actualiza los datos del local (auth, solo dueño)
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk=None):
        perfil = Perfil.objects.filter(pk=pk, tipo=Perfil.TipoPerfil.LOCAL).first()
        if not perfil:
            return Response({'error': 'Local no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(LocalPerfilSerializer(perfil).data)

    def put(self, request, pk=None):
        perfil = Perfil.objects.filter(pk=pk).first()
        if not perfil:
            return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario_id != request.user.usuario_id:
            return Response(
                {'error': 'No puedes editar el local de otro usuario'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if perfil.tipo != Perfil.TipoPerfil.LOCAL:
            return Response(
                {'error': 'Solo un perfil de tipo local puede tener datos de local'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existente = Local.objects.filter(perfil=perfil).first()
        serializer = LocalWriteSerializer(existente, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(perfil=perfil)

        perfil.refresh_from_db()
        return Response(LocalPerfilSerializer(perfil).data, status=status.HTTP_200_OK)
