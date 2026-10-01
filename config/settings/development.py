"""
Django settings for Ensamblia API — DEVELOPMENT.
Configuración para desarrollo local.
"""

from .base import *

# ============================================================
# SEGURIDAD (permisiva)
# ============================================================
DEBUG = True

# En dev, si no hay SECRET_KEY en .env, usamos una por defecto
SECRET_KEY = SECRET_KEY or 'django-insecure-dev-ensamblia-cambia-esto'

# ============================================================
# CORS (abierto para facilitar el desarrollo)
# ============================================================
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# ============================================================
# LOGGING (más verbose en dev)
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
        'level': 'INFO',
    },
}