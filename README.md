# Ensamblia

Red social para músicos. API en Django + DRF + Channels, frontend en React + Vite.

Migrada desde Node.js/Express. El frontend se rediseñó completo en 2026
siguiendo el design system del landing (amarillo/crema/ink + DM Mono).

---

## Stack

### Back

- Python 3.11+
- Django 5
- Django REST Framework
- PostgreSQL 17 (Docker)
- Redis 7 (Channels + cache de presencia)
- MinIO (S3-compatible) para archivos
- Daphne (ASGI, WebSockets)
- pytest + pytest-django + pytest-asyncio (208 tests)

### Front

- React 19
- Vite 8
- React Router 7
- CSS Modules (cero estilos inline)
- Vitest 5 + Testing Library + MSW 3 + mock-socket (239 tests)
- lucide-react (iconos)

---

## Puesta en marcha (desarrollo)

### Requisitos

- Python 3.11+
- Node 20+
- Docker Desktop

### 1. Levantar servicios (BD, Redis, MinIO)

Desde la carpeta `ensamblia DB/`:

    docker compose up -d

Verifica:

    docker ps

Debes ver:

- `ensamblia_db` (PostgreSQL, puerto 5434)
- `ensamblia_redis` (Redis, puerto 6379)
- `ensamblia_minio` (MinIO, puertos 9000 API / 9001 consola)
- `ensamblia_minio_init` (aplica la bucket policy y termina)

### 2. Back

    cd "Proyecto final - Ensamblia"
    python -m venv .venv
    # Windows: .\.venv\Scripts\Activate.ps1
    # Linux/Mac: source .venv/bin/activate
    pip install -r requirements.txt

    cp .env.example .env
    # Edita .env con tus credenciales (por defecto ya funciona con el compose)

    python manage.py migrate
    python manage.py seed_data
    python manage.py createsuperuser

    python manage.py runserver

- API: http://127.0.0.1:8000/api
- Swagger: http://127.0.0.1:8000/api/docs/
- Admin: http://127.0.0.1:8000/admin/

### 3. Front

    cd frontend
    npm install
    cp .env.example .env
    npm run dev

- App: http://localhost:5173

### Credenciales del seed

- `ana` / `ana123`
- `luis` / `luis123`
- `marta` / `marta123`

---

## Tests

### Back

    python -m pytest -q

208 tests. Cubren:

- Auth (registro, login, tokens, 401/403)
- Perfiles (CRUD, validaciones, N:M)
- Anuncios (CRUD, propiedad, paginación, filtros, búsqueda, ordenación)
- Comentarios (CRUD, propiedad)
- Chats (privacidad, no leídos, iniciar conversación)
- Mensajes (CRUD, privacidad, adjuntos)
- Mensajes leídos (privacidad)
- WebSockets (conexión, mensajes, typing, edición, borrado, adjuntos)
- Catálogo (permisos admin)
- Multimedia (CRUD, presigned URL, contrato storage híbrido)

### Front

    cd frontend
    npm run test:run
    npm run test
    npm run test:coverage

239 tests. Cubren:

- `api/axios` (extractList, parseApiError, interceptor 401, barra final)
- `AuthContext` (hidratación, login, logout, evento auth:unauthorized)
- Router (guards, layouts)
- Navbars (landing + app, condicionales a sesión, badge)
- `ui/` (Button, IconButton, Input, Textarea, Select, Field, Card, Tag, Badge, Avatar, SectionLabel, PageHeader, EmptyState, Modal, Lightbox, Spinner)
- Páginas (Login, Register, 404, Anuncios, Detalle, Crear, Perfil público)
- Chat (ChatBox, ConversationItem, ChatHeader, MensajeBubble, MessageInput, DeleteMessageModal, AdjuntoPreview)
- Multimedia (MultimediaPreview, FileUploader, MediaGallery, EditarMediosModal)
- Anuncios (AnuncioCard, MisAnuncios, Comentarios, FiltrosAnuncios)

---

## Contrato MinIO híbrido

Los archivos viven en MinIO (S3-compatible) bajo dos prefijos con políticas distintas:

| Prefijo | Visibilidad | URL | Quién |
|---|---|---|---|
| `multimedia/*` | Público | http://127.0.0.1:9000/ensamblia-media/multimedia/... (estable, sin firma) | Biblioteca de medios del perfil, anuncios, avatares |
| `chat/*` | Privado | .../chat/...?X-Amz-Signature=... (firmada, 300s) | Adjuntos efímeros del chat |

Implementación:

- Bucket policy selectiva (`minio-policy.json`): permite `s3:GetObject` anónimo solo en `multimedia/*`.
- Dos storages en Django (`base.py`): `default` (firmado, chat) y `public_media` (sin firma, `default_acl='public-read'`).
- `Multimedia.archivo` usa `storage=public_media`.
- `MensajeAdjunto.archivo` usa `default`.
- `presigned_url` de multimedia añade `ACL='public-read'` al `PUT`; el front envía `x-amz-acl: public-read` en la subida.

Tests de contrato:

- multimedia: URL sin `X-Amz-Signature`.
- chat: URL con `X-Amz-Signature`.

---

## Design system

El front usa CSS Modules en todas partes (cero estilos inline) y un design system en `src/components/ui/`.

- Tokens en `src/index.css` (paleta landing + DM Mono + Inter).
- Componentes en `src/components/ui/`: Button, IconButton, Spinner, Field, Input, Textarea, Select, Card, Tag, Badge, Avatar, SectionLabel, PageHeader, EmptyState, Modal, Lightbox.
- Hooks en `src/hooks/`: useBodyLock, useFocusTrap.
- Alias `@/` -> `src/` (configurado en `vite.config.js` y `jsconfig.json`).

El landing (`/`) mantiene su propio `landing.css` (diseño original), y el resto de la app usa el design system.

---

## WebSockets

- Chat: `ws://localhost:8000/ws/chat/<chat_id>/?token=<JWT>`
  - Entrantes: `mensaje`, `typing`, `leido`, `editar_mensaje`, `borrar_mensaje`.
  - Salientes: `mensaje`, `typing`, `leido`, `status`, `presence_snapshot`, `mensaje_editado`, `mensaje_borrado`.
- Notificaciones globales: `ws://localhost:8000/ws/notifications/?token=<JWT>`
  - Salientes: `nuevo_mensaje`.

Token: JWT en query string (`?token=`), validado por `JwtAuthMiddleware`.

Reconexión: el front reintenta cada 2s si el WS se cae.

---

## Estructura

    Proyecto final - Ensamblia/
    ├── .env.example
    ├── manage.py
    ├── pytest.ini
    ├── requirements.txt
    ├── README.md
    ├── MIGRATION_NOTES.md
    ├── minio-policy.json
    ├── config/
    │   ├── settings/
    │   │   ├── base.py
    │   │   ├── development.py
    │   │   └── production.py
    │   ├── asgi.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── apps/
    │   ├── usuarios/
    │   ├── catalogo/
    │   ├── perfiles/
    │   ├── anuncios/
    │   ├── chats/
    │   └── multimedia/
    ├── ensamblia DB/
    │   ├── docker-compose.yml
    │   └── .env
    └── frontend/
        ├── src/
        │   ├── api/
        │   ├── components/
        │   ├── context/
        │   ├── hooks/
        │   ├── pages/
        │   ├── router/
        │   ├── test/
        │   ├── utils/
        │   ├── App.jsx
        │   ├── index.css
        │   └── main.jsx
        ├── vite.config.js
        ├── jsconfig.json
        └── README.md

---

## Problemas conocidos

Ninguno bloqueante.

Cosas a vigilar:

- URLs firmadas de `chat/*` caducan a los 300s. Si un usuario deja el chat abierto mucho tiempo, los adjuntos antiguos que se cargan al hacer scroll tendrán URLs caducadas. Pendiente: `onError` en AdjuntoPreview que re-firme.
- Vídeos del chat: se muestran con controles nativos, sin lightbox. Los de multimedia (anuncios/perfil) sí se amplían. Decisión consciente.
- WS de notificaciones en StrictMode: resuelto en G.3 (creación diferida del socket).

---

## Equipo

Proyecto final (IFCD0112) — 2026.

- Maite
- Marga
- Raquel
- Luis