from apps.perfiles.models import Perfil


class MiPerfilMixin:
    """Provee utilidades para saber el perfil del usuario logueado."""

    def get_mi_perfil_id(self, request):
        if not request.user or not request.user.is_authenticated:
            return None
        perfil = Perfil.objects.filter(usuario_id=request.user.usuario_id).first()
        return perfil.perfil_id if perfil else None