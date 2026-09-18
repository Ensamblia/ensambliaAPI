from rest_framework.permissions import BasePermission, SAFE_METHODS


class EsPropietarioOAdmin(BasePermission):
    """
    Permiso para objetos que tengan un campo `perfil`.
    Uso: `permission_classes = [EsPropietarioOAdmin]` en la vista,
    y la vista debe tener un método `get_mi_perfil_id(request)` que
    devuelva el perfil_id del usuario logueado.
    """

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        mi_perfil_id = view.get_mi_perfil_id(request)
        return getattr(obj, 'perfil_id', None) == mi_perfil_id


class EsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)