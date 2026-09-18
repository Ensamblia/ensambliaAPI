# 🎸 Ensamblia API (Django)

API REST para músicos. Migrada desde Node.js/Express a Django + DRF.

---

## 📋 Requisitos

- Python 3.11+
- PostgreSQL 17 (vía Docker)
- Docker Desktop

---

## 🚀 Puesta en marcha

### 1. Entrar al proyecto

    cd "Proyecto final - Ensamblia"

### 2. Crear y activar el entorno virtual

Windows (PowerShell):

    python -m venv .venv
    .\.venv\Scripts\Activate.ps1

Linux/Mac:

    python3 -m venv .venv
    source .venv/bin/activate

### 3. Instalar dependencias

    pip install -r requirements.txt

### 4. Levantar la base de datos (Docker)

Desde la carpeta "ensamblia DB":

    docker compose up -d

Verifica que el contenedor esté arriba:

    docker ps

Deberías ver `ensamblia_db` escuchando en el puerto `5434` y `pgadmin_ensamblia` en el `8081`.

### 5. Configurar variables de entorno

Copia el archivo de ejemplo:

    cp .env.example .env

Edita `.env` con tus credenciales.

### 6. Aplicar migraciones

    python manage.py migrate

### 7. Crear superusuario (para el admin de Django)

    python manage.py createsuperuser

Te pedirá:

- Nickname: tu nombre de usuario admin
- Password: tu contraseña
- (No pide email porque el Custom User no lo usa)

### 8. Arrancar el servidor

    python manage.py runserver

- API: http://127.0.0.1:8000/api
- Swagger: http://127.0.0.1:8000/api/docs/
- Admin Django: http://127.0.0.1:8000/admin/

---

## 🔑 Endpoints principales

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro `{usuario, password}` |
| POST | `/api/auth/login` | Login `{usuario, password}` → `{token}` |

### Recursos (GET público, resto requiere `Authorization: Bearer <token>`)

| Recurso | Base |
|---------|------|
| Anuncios | `/api/anuncios` |
| Comentarios | `/api/comentarios` |
| Perfiles | `/api/perfiles` |
| Chats | `/api/chats` |
| Mensajes | `/api/mensajes` |
| Multimedia | `/api/multimedias` |
| Comarcas | `/api/comarcas` |
| Ciudades | `/api/ciudades` |
| Instrumentos | `/api/instrumentos` |
| Géneros musicales | `/api/genero_musical` |
| Grupos | `/api/grupos` |
| Tipos de anuncio | `/api/tipo-anuncios` |
| Tipos de archivo | `/api/tipo-archivos` |

### Pivotes

- `/api/perfil-chats`
- `/api/perfil-genero-musicales`
- `/api/perfil-grupos`
- `/api/perfil-instrumentos`
- `/api/grupo-generos`
- `/api/mensaje-leidos`

### Endpoints custom

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/perfiles/me` | Perfil del usuario logueado |
| GET | `/api/perfiles/usuario?usuario_id=1` | Perfiles por usuario |
| GET | `/api/perfiles/comarca?comarca_id=1` | Perfiles por comarca |
| POST | `/api/chats/con/:otro_perfil_id` | Inicia/busca chat 1-a-1 |
| GET | `/api/comentarios/anuncio?anuncio_id=1` | Comentarios de un anuncio |
| GET | `/api/comentarios/perfil?perfil_id=1` | Comentarios de un perfil |
| GET | `/api/mensajes/chat?chat_id=1` | Mensajes de un chat |
| GET | `/api/mensajes/perfil?perfil_id=1` | Mensajes de un perfil |
| GET | `/api/multimedias/perfil?perfil_id=1` | Multimedia de un perfil |
| GET | `/api/multimedias/anuncio?anuncio_id=1` | Multimedia de un anuncio |

Swagger completo: http://127.0.0.1:8000/api/docs/

---

## 🗄️ Base de datos

- Motor: PostgreSQL 17 (Docker)
- Contenedor: `ensamblia_db`
- Puerto host: `5434`
- Base de datos: `EMNSAMBLIA_DB`
- Usuario: `root`

Para conectarte manualmente:

    docker exec -it ensamblia_db psql -U root -d EMNSAMBLIA_DB

Consultas útiles:

    \dt                          -- Listar tablas
    \d perfil                    -- Ver estructura de tabla
    SELECT * FROM usuario;       -- Ver usuarios
    SELECT * FROM perfil;        -- Ver perfiles

---

---

## 🧪 Probar la API

### Registro

    curl -X POST http://127.0.0.1:8000/api/auth/register ^
      -H "Content-Type: application/json" ^
      -d "{\"usuario\": \"test\", \"password\": \"test123\"}"

### Login

    curl -X POST http://127.0.0.1:8000/api/auth/login ^
      -H "Content-Type: application/json" ^
      -d "{\"usuario\": \"test\", \"password\": \"test123\"}"

### Crear perfil (con token)

    curl -X POST http://127.0.0.1:8000/api/perfiles ^
      -H "Authorization: Bearer TOKEN_AQUI" ^
      -H "Content-Type: application/json" ^
      -d "{\"nombre\": \"Juan\", \"apellido\": \"Perez\", \"correo\": \"juan@test.com\", \"descripcion\": \"Guitarrista\"}"

---

## 🏗️ Estructura del proyecto

    Proyecto final - Ensamblia/
    ├── .venv/                         # Entorno virtual
    ├── .env                           # Variables de entorno (NO subir a git)
    ├── .env.example                   # Plantilla
    ├── .gitignore
    ├── manage.py
    ├── requirements.txt
    ├── README.md                      # Este archivo
    ├── MIGRATION_NOTES.md             # Notas de migración Node -> Django
    ├── config/                        # Proyecto Django
    │   ├── settings.py
    │   ├── urls.py
    │   └── ...
    ├── apps/                          # Aplicaciones
    │   ├── usuarios/                  # Custom User + auth
    │   ├── catalogo/                  # comarcas, ciudades, instrumentos, géneros, grupos, tipos de archivo
    │   ├── perfiles/                  # perfiles + pivotes
    │   ├── anuncios/                  # anuncios, comentarios, tipos de anuncio
    │   ├── chats/                     # chats, mensajes, mensajes leídos
    │   └── multimedia/                # multimedia
    ├── ensamblia DB/                  # Docker + SQL
    ├── ensamblia API/                 # Proyecto Node original (referencia)
    └── frontend/                      # React

---

## 📄 Paginación, Búsqueda, Filtrado y Ordenación

### Paginación (LimitOffset)

Los endpoints de **listados grandes** devuelven respuestas paginadas:

```
GET /api/anuncios?limit=20&offset=0
```

**Respuesta:**
```json
{
    "count": 47,
    "next": "http://localhost:8000/api/anuncios?limit=20&offset=20",
    "previous": null,
    "results": [
        { "anuncio_id": 1, "titulo": "..." },
        { "anuncio_id": 2, "titulo": "..." }
    ]
}
```

**Parámetros:**
- `?limit=20` → tamaño de página (máximo 100, default 20)
- `?offset=40` → desplazamiento

**Endpoints paginados**: `anuncios`, `perfiles`, `comentarios`, `mensajes`, `multimedia`, `usuarios`.

**Endpoints NO paginados**: catálogos (`comarcas`, `ciudades`, `instrumentos`, `genero_musical`, `grupos`, `tipo-anuncios`, `tipo-archivos`) y pivotes (`perfil-chats`, `perfil-grupos`, `perfil-genero-musicales`, `perfil-instrumentos`, `grupo-generos`, `mensaje-leidos`).

### Búsqueda

```
GET /api/anuncios?search=guitarra
GET /api/perfiles?search=luis
```

Busca en campos de texto relevantes por cada recurso.

### Filtrado

```
GET /api/anuncios?tipo_anuncio=1
GET /api/perfiles?comarca=1&disponibilidad=true
GET /api/comentarios?anuncio=1&esta_eliminado=false
GET /api/anuncios?fecha_publicacion__gte=2026-01-01
```

> ⚠️ Los filtros usan el **nombre del campo del modelo** (`tipo_anuncio`), no el de la columna (`tipo_anuncio_id`).

### Ordenación

```
GET /api/anuncios?ordering=-fecha_publicacion
GET /api/perfiles?ordering=edad,-fecha_creacion
```

Prefijo `-` para orden descendente. Múltiples campos separados por coma.

### En el front (React)

Las respuestas paginadas ya **NO** son arrays planos:

```javascript
// ❌ Antes
const lista = res.data;

// ✅ Ahora
const lista = res.data.results;

// ✅ Con helper (soporta ambos)
import { extractList } from '../api/axios';
const lista = extractList(res);
```

## 🧠 Notas técnicas

### Custom User Model

- Tabla: `ensamblia.usuario`
- Campo de login: `nickname` (expuesto como `usuario` al front)
- Password: guardado como `password_hash` en DB (via `db_column`)
- Campos añadidos: `is_staff`, `is_superuser`, `is_active`, `last_login`

### JWT

- Algoritmo: HS256
- Token de acceso: 2 horas
- Formato de respuesta: `{ token: "..." }` (compatible con Node)

### CORS

- Totalmente abierto en dev (`CORS_ALLOW_ALL_ORIGINS = True`)
- En producción, restringir a dominios específicos

### Serializers con FK

Cuando el campo del modelo es `xxx` con `db_column='xxx_id'`, el serializer **debe** declarar explícitamente:

- Output: `xxx_id = serializers.IntegerField(read_only=True, allow_null=True)`
- Input: `xxx_id = serializers.PrimaryKeyRelatedField(source='xxx', queryset=...)`

Si no, DRF devuelve `null` silenciosamente.

---

## 🐛 Problemas conocidos

Ninguno actualmente. Ver `MIGRATION_NOTES.md` para cambios respecto a Node.

---

## 👥 Equipo

- Maite
- Marga
- Raquel
- Luis