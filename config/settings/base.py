"""
Django settings for Ensamblia API — BASE.
Configuración común a todos los entornos.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# BASE_DIR apunta a la raíz del proyecto (2 niveles arriba de este archivo)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

load_dotenv(BASE_DIR / '.env')


# ============================================================
# SEGURIDAD (lo mínimo común, cada entorno lo completa)
# ============================================================
SECRET_KEY = os.getenv('SECRET_KEY')   # ← puede ser None en base

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# ============================================================
# APPS
# ============================================================
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    'django_filters',
    'channels',
    'storages', 

    # Local apps
    'apps.usuarios',
    'apps.catalogo',
    'apps.perfiles',
    'apps.anuncios',
    'apps.chats',
    'apps.multimedia',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'


# ============================================================
# CHANNELS (WebSockets)
# ============================================================
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [
                {
                    'address': f"redis://{os.getenv('REDIS_HOST', '127.0.0.1')}:{os.getenv('REDIS_PORT', '6379')}",
                    'socket_timeout': 30,
                    'socket_connect_timeout': 30,
                    'socket_keepalive': True,
                },
            ],
            'symmetric_encryption_keys': [SECRET_KEY or 'dummy'],
        },
    },
}


# ============================================================
# CACHES (Redis) — para presence del chat
# ============================================================
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': f"redis://{os.getenv('REDIS_HOST', '127.0.0.1')}:{os.getenv('REDIS_PORT', '6379')}/1",
        'OPTIONS': {
            'socket_timeout': 30,
            'socket_connect_timeout': 30,
        },
    },
}


# ============================================================
# BASE DE DATOS — PostgreSQL
# ============================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'ENSAMBLIA_DB'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', '127.0.0.1'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}


# ============================================================
# CUSTOM USER MODEL
# ============================================================
AUTH_USER_MODEL = 'usuarios.Usuario'


# ============================================================
# AUTENTICACIÓN / JWT
# ============================================================
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 6},
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'apps.usuarios.exceptions.drf_exception_handler',

    'DEFAULT_PAGINATION_CLASS': 'apps.usuarios.pagination.StandardLimitOffsetPagination',
    'PAGE_SIZE': 20,

    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', '120'))
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'usuario_id',
    'USER_ID_CLAIM': 'usuario_id',
}


# ============================================================
# INTERNACIONALIZACIÓN
# ============================================================
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ============================================================
# STATIC / MEDIA
# ============================================================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ============================================================
# MINIO (S3-COMPATIBLE) — Almacenamiento de archivos
# ============================================================
MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'http://127.0.0.1:9000')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'ensamblia_minio')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'ensamblia_minio_2026_secure')
MINIO_BUCKET_NAME = os.getenv('MINIO_BUCKET_NAME', 'ensamblia-media')

# URL pública del bucket (para construir URLs de archivos)
MINIO_PUBLIC_URL = os.getenv('MINIO_PUBLIC_URL', 'http://127.0.0.1:9000')

STORAGES = {
    'default': {
        'BACKEND': 'storages.backends.s3.S3Storage',
        'OPTIONS': {
            'endpoint_url': MINIO_ENDPOINT,
            'access_key': MINIO_ACCESS_KEY,
            'secret_key': MINIO_SECRET_KEY,
            'bucket_name': MINIO_BUCKET_NAME,
            'region_name': 'us-east-1',
            'signature_version': 's3v4',
            'addressing_style': 'path',
            'default_acl': None,
            'querystring_auth': True,
            'querystring_expire': 300,
            'file_overwrite': False,
            'custom_domain': None,
        },
    },
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
    },
}

# ============================================================
# DRF SPECTACULAR (Swagger)
# ============================================================
SPECTACULAR_SETTINGS = {
    'TITLE': 'Ensamblia API',
    'DESCRIPTION': 'API REST para músicos. Migrada de Node.js a Django.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}