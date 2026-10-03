"""
Django settings for Ensamblia API — PRODUCTION.
Configuración para producción.

⚠️  Falla al arrancar si no están definidas las variables críticas.
"""

from .base import *
import os
from django.core.exceptions import ImproperlyConfigured


# ============================================================
# VALIDACIONES DE ENTORNO
# ============================================================
def _require_env(name):
    """Devuelve la variable de entorno o falla si no existe."""
    value = os.getenv(name)
    if not value:
        raise ImproperlyConfigured(
            f'La variable de entorno {name} es obligatoria en producción.'
        )
    return value


# ============================================================
# SEGURIDAD (estricta)
# ============================================================
DEBUG = False

SECRET_KEY = _require_env('SECRET_KEY')

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
if not ALLOWED_HOSTS or not ALLOWED_HOSTS[0]:
    raise ImproperlyConfigured(
        'ALLOWED_HOSTS debe estar definida en producción.'
    )

# ============================================================
# CORS (restringido a los dominios permitidos)
# ============================================================
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True

# ============================================================
# HTTPS / SEGURIDAD
# ============================================================
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 año
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ============================================================
# MINIO EN PRODUCCIÓN — bucket privado obligatorio
# ============================================================
# Fuerza URLs firmadas con expiración corta en producción.
# (En base ya está en 300s, pero lo reafirmamos por si alguien
#  cambia base sin mirar producción.)
STORAGES['default']['OPTIONS']['querystring_auth'] = True
STORAGES['default']['OPTIONS']['querystring_expire'] = 300
STORAGES['default']['OPTIONS']['default_acl'] = None

# Endpoint público de MinIO (dominio con HTTPS, NUNCA la IP interna).
# Ej: https://media.ensamblia.com
MINIO_PUBLIC_URL = _require_env('MINIO_PUBLIC_URL')

# Advertencia: si MINIO_ENDPOINT apunta a una IP interna, perfecto.
# Pero MINIO_PUBLIC_URL debe ser un dominio con HTTPS delante de un proxy.

# ============================================================
# LOGGING
# ============================================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
}