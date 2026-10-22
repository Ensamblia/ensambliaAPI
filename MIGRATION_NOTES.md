# Notas de migración: Node.js -> Django

Documento para el equipo con lo que ha cambiado respecto al proyecto original en Node.js.
Incluye, al final, el rediseño del frontend (2026) y el estado actual del proyecto.

---

## Auth

| Aspecto | Node | Django |
|---|---|---|
| Registro | POST /api/auth/register con {usuario, password} | Igual |
| Login | POST /api/auth/login con {usuario, password} -> {token} | Igual |
| Token | JWT HS256 con {usuario_id, usuario, is_staff} | Igual |
| Duración | 2h | 2h |
| Admin | vía .env (ADMIN_USER, ADMIN_PASSWORD_HASH) | Eliminado, usar `python manage.py createsuperuser` |
| Admin key para registro | `admin_key` en register | Eliminado, usar Django admin |

Cambios de comportamiento:

- Registro: ya no acepta `admin_key`. Todos los usuarios registrados son usuarios normales.
- Admin: se gestiona con Django auth. `is_staff` es el flag para admins.
- Login admin: ya no se puede usar `ADMIN_USER` del `.env`. Hay que crear un superuser con `createsuperuser`.

---

## Códigos HTTP

| Caso | Node | Django |
|---|---|---|
| Lista vacía | 404 {error: "Nothing found"} | 200 [] (arreglado) |
| Recurso no encontrado | 404 {error: "..."} | 404 {error: "..."} |
| Sin token | 401 {mensaje: "Token not given"} | 401 {detail: "..."} (DRF estándar) |
| Sin permisos | 403 {error: "..."} | 403 {error: "..."} |

El front puede necesitar ajustar el parseo de errores de auth. Los mensajes ya no están en `mensaje` sino en `detail`.
El front usa `parseApiError` (en `src/api/axios.js`) que normaliza los formatos
`detail`, `error`, `message` y errores de validación por campo.

---

## Respuestas

Formato de error en Node:

    { "error": "..." }       // mayoría
    { "mensaje": "..." }     // auth

Formato de error en Django (DRF estándar):

    { "detail": "..." }                       // errores generales
    { "campo": ["mensaje de error"] }         // errores de validación

Ejemplo de error de validación en Django:

    {
        "titulo": ["Titulo is a mandatory field. Cannot be undefined or null"]
    }

El front usa `parseApiError(err)` que extrae el mensaje en este orden:
`detail` -> `error` -> `message` -> primer campo -> fallback.

---

## Base de datos

| Aspecto | Node | Django |
|---|---|---|
| Schema | ensamblia | public (cambio) |
| Gestión | SQL manual | Django ORM + migraciones |
| Tablas | Mismas | Mismas (con nombres idénticos) |
| Columnas | Mismas | Mismas |
| usuario | nickname + password_hash | nickname + password_hash + is_staff + is_superuser + is_active + last_login |
| administrador | Tabla propia | Eliminada, Django auth |

Cambios en columnas:

- `tipo_anuncio.tipo` renombrado a `tipo_anuncio.nombre` en DB, se serializa como `tipo` al front.
- `tipo_archivo.mime_type` ampliado de VARCHAR(15) a VARCHAR(100).
- Timestamps: todos timestamp with time zone, `USE_TZ=True`, `TIME_ZONE=UTC`.
- IDs: bigint GENERATED ALWAYS AS IDENTITY (equivalente a BigAutoField).
- Añadidos `is_staff`, `is_superuser`, `is_active`, `last_login` a `usuario`.
- Eliminada tabla `administrador`.

Tests: se configuró `TEST['NAME'] = 'test_ENSAMBLIA_DB'` y se creó la BD
`postgres` en el contenedor para evitar el RuntimeWarning de Django.

---

## Serializers con FK

Node usaba queries manuales con `xxx_id`. Django requiere declarar explícitamente
los campos FK si el nombre de la columna no coincide con el nombre del campo.

Regla:

Si el modelo tiene:

    campo = ForeignKey(Modelo, db_column='campo_id')

El serializer debe declarar:

- Output: `campo_id = serializers.IntegerField(read_only=True)`
- Input: `campo_id = serializers.PrimaryKeyRelatedField(source='campo', queryset=...)`

Si no, DRF devuelve `null` silenciosamente.

Esto ya está aplicado en todos los serializers del proyecto.

Excepción:

Si la FK es primary_key del modelo (como en las tablas pivote `perfil_chat`, `perfil_grupo`, etc.),
no hace falta declararla porque Django expone automáticamente el atributo `xxx_id`.

---

## Docker

| Aspecto | Node | Django |
|---|---|---|
| Contenedor PostgreSQL | ensamblia_db | Igual |
| Puerto | 5434 | Igual |
| pgAdmin | pgadmin_ensamblia en 8081 | Igual |
| Base de datos | ENSAMBLIA_DB | Igual |
| Redis | No | ensamblia_redis (Channels + cache de presencia) |
| MinIO | No | ensamblia_minio + minio-init |

Se añadió `minio-policy.json` (bucket policy selectiva: `multimedia/*` público, `chat/*` privado).

---

## Frontend (React)

El front NO necesita cambios de contrato respecto a Node salvo:

1. Los mensajes de error de auth ahora vienen en `detail`, no en `mensaje`.
2. Si el front comprobaba 404 para "lista vacía", ahora recibe 200 con [].

Todo lo demás (nombres de campos, paths, métodos HTTP, códigos) es idéntico.

### Cómo verificar que el front sigue funcionando

1. Arranca el backend:

       python manage.py runserver

2. Arranca el frontend:

       cd frontend
       npm run dev

3. Comprueba que:
   - Login funciona.
   - Registro funciona.
   - Listado de anuncios carga.
   - Crear anuncio funciona.
   - Perfiles cargan.
   - Chat funciona.

Si algo falla, el 99% de las veces es porque el front esperaba un mensaje de error en `mensaje` y ahora está en `detail`.

---

## Rediseño del frontend (2026)

El frontend se reescribió completo siguiendo el design system del landing.

Antes (heredado de Node):

- Estilos inline en casi todos los componentes.
- Paleta coral `#FF5C35` + blanco.
- `index.css` con tokens viejos.
- Landing con su propio CSS.

Después:

- Cero estilos inline (excepto valores dinámicos puntuales vía CSS custom properties).
- CSS Modules en todas las páginas y componentes.
- Design system en `src/components/ui/` (16 componentes).
- Tokens nuevos en `index.css` (paleta landing: amarillo `#FFDC36`, ink `#20251F`, cream `#FFFDF8`, DM Mono + Inter).
- Alias `@/` -> `src/`.
- `landing.css` se mantiene (landing intacto).
- Layout de dos columnas en PerfilPage y ChatBox (desktop).
- Lightbox para imágenes en chat, anuncios y biblioteca.
- Modal del design system en confirmaciones (antes `window.confirm`).

### Compatibilidad con el front de Node

El contrato de la API no cambia (paths, nombres de campos JSON, métodos HTTP).
Solo hay dos diferencias:

1. Los errores de auth vienen en `detail` (no en `mensaje`). `parseApiError` los normaliza.
2. Las listas vacías devuelven `200 []` (no `404`). El front usa `extractList` o `?? []`.

---

## Estructura actual del front

    frontend/src/
    ├── api/                 axios, ws, multimedia, perfiles
    ├── components/
    │   ├── ui/              16 componentes del design system (CSS Modules)
    │   ├── navbar/          LandingNavbar, Navbar
    │   ├── cards/           AnuncioCard
    │   ├── chat/            ChatBox, ConversationItem, ChatHeader, MensajeBubble,
    │   │                    MessageInput, DeleteMessageModal, AdjuntoPreview
    │   ├── multimedia/      MultimediaPreview, FileUploader, MediaGallery,
    │   │                    EditarMediosModal, AnuncioMultimediaGaleria
    │   ├── anuncios/        MisAnuncios
    │   ├── comentarios/     Comentarios
    │   ├── filters/         FiltrosAnuncios
    │   ├── perfil/          AutorNombre
    │   └── ...
    ├── context/             AuthContext, NotificationsContext
    ├── hooks/               useBodyLock, useFocusTrap
    ├── pages/               9 páginas
    ├── router/              AppRouter, guards, PublicLayout, AppLayout
    ├── test/                setup, msw, utils (mockXHR, mock-socket, renderWithProviders)
    ├── utils/               chatPreview
    ├── App.jsx
    └── main.jsx

### Tests del front

- Vitest 5 + Testing Library + MSW 3 + mock-socket.
- 239 tests en 44 archivos.
- Pool `vmThreads` (reutiliza entorno jsdom, ~8s).
- Polyfills de `ReadableStream` y `WritableStream` en `src/test/polyfills.js` (necesarios para MSW en `vmThreads`).
- `src/test/msw/handlers.js`: handlers por endpoint (auth, perfiles, anuncios, chats, comentarios, multimedia).
- `src/test/utils/`: renderWithProviders, socket (mock-socket), mockXHR.

---

## Comandos útiles

Arrancar el servidor:

    python manage.py runserver

Migraciones:

    python manage.py makemigrations
    python manage.py migrate

Shell interactivo:

    python manage.py shell

Crear superuser:

    python manage.py createsuperuser

Cambiar password de un usuario:

    python manage.py changepassword NICKNAME

Ver el SQL de una migración:

    python manage.py sqlmigrate perfiles 0001

Ver el estado de las migraciones:

    python manage.py showmigrations

Comprobar que todo está bien configurado:

    python manage.py check

Tests back:

    python -m pytest -q
    python -m pytest apps/chats/tests/test_websocket.py -v

Front:

    cd frontend
    npm install
    npm run dev
    npm run build
    npm run test:run
    npm run test:coverage

---

## Resumen ejecutivo

| Aspecto | Compatible con front Node |
|---|---|
| Paths de endpoints | Sí |
| Nombres de campos JSON | Sí |
| Métodos HTTP | Sí |
| Estructura de recursos | Sí |
| Código HTTP éxito | Sí |
| Código HTTP lista vacía | Cambiado: 404 -> 200 |
| Formato error validación | Cambiado |
| Formato error auth | Cambiado: mensaje -> detail |
| JWT formato | Sí |

### Acción requerida en el front (ya hecha)

- `parseApiError` (normaliza errores).
- `extractList` (soporta `{count, results}` y arrays).
- Response interceptor 401 (logout + redirect a `/login`).
- Hidratación con `loading` en AuthContext.
- Guards en `/login` y `/register`.

---

## Troubleshooting

"connection timeout expired":

- Verifica que Docker está corriendo: `docker ps`.
- Verifica que `DB_HOST=127.0.0.1` (no `localhost`) en `.env`.
- Verifica que el contenedor `ensamblia_db` está activo.

"Token is invalid":

- Revisa que el token se envía como `Authorization: Bearer <token>`.
- No uses la pestaña "Auth" de Postman; usa la pestaña "Headers" manualmente.
- Asegúrate de no copiar saltos de línea al pegar el token.

"column xxx does not exist":

- Alguna migración no está aplicada. Ejecuta `python manage.py showmigrations` y `python manage.py migrate`.

"relation xxx does not exist":

- La base de datos está vacía o desincronizada. Revisa `python manage.py migrate`.

"WebSocket is closed before established" (dev):

- Resuelto en G.3: la creación del socket se difiere con `setTimeout(0)`, y el cleanup cancela el timeout si el componente se desmonta antes.

"ReferenceError: ReadableStream is not defined" (tests):

- Resuelto en G.5: `src/test/polyfills.js` importa `ReadableStream` y `WritableStream` desde `node:stream/web`.

"warning: connection to 'postgres' database":

- Resuelto en G.4: creada BD `postgres` + `TEST['NAME'] = 'test_ENSAMBLIA_DB'`.

---

## Equipo

Proyecto final (IFCD0112) — 2026.

- Maite
- Marga
- Raquel
- Luis