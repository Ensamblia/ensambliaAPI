from rest_framework.views import exception_handler


def drf_exception_handler(exc, context):
    """
    Envuelve el handler por defecto. Aseguramos que las respuestas usen
    el formato estándar DRF ({detail: ...} o {campo: [errores]}).
    """
    return exception_handler(exc, context)