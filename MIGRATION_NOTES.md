# 📝 Notas de migración: Node.js → Django

Documento para el equipo con lo que ha cambiado respecto al proyecto original en Node.js.

---

## 🔑 Auth

| Aspecto | Node | Django |
|---------|------|--------|
| Registro | POST /api/auth/register con {usuario, password} | Igual ✅ |
| Login | POST /api/auth/login con {usuario, password} → {token} | Igual ✅ |
| Token | JWT HS256 con {usuario_id, usuario, is_staff} | Igual ✅ |
| Duración | 2h | 2h |
| Admin | vía .env (ADMIN_USER, ADMIN_PASSWORD_HASH) | ❌ Eliminado → usar `python manage.py createsuperuser` |
| Admin key para registro | `admin_key` en register | ❌ Eliminado → usar Django admin |

### ❗ Cambios de comportamiento

- Registro: ya no acepta `admin_key`. Todos los usuarios registrados son usuarios normales.
- Admin: se gestiona con Django auth. `is_staff` es el flag para admins.
- Login admin: ya no se puede usar `ADMIN_USER` del `.env`. Hay que crear un superuser con `createsuperuser`.

---

## 📊 Códigos HTTP

| Caso | Node | Django |
|------|------|--------|
| Lista vacía | 404 {error: "Nothing found"} | 200 [] ✅ (arreglado) |
| Recurso no encontrado | 404 {error: "..."} | 404 {error: "..."} ✅ |
| Sin token | 401 {mensaje: "Token not given"} | 401 {detail: "..."} ⚠️ (DRF estándar) |
| Sin permisos | 403 {error: "..."} | 403 {error: "..."} ✅ |

⚠️ El front puede necesitar ajustar el parseo de errores de auth. Los mensajes ya no están en `mensaje` sino en `detail`.

---

## 📝 Respuestas

### Formato de error

Node:

    { "error": "..." }       // mayoría
    { "mensaje": "..." }     // auth

Django (DRF estándar):

    { "detail": "..." }                       // errores generales
    { "campo": ["mensaje de error"] }         // errores de validación

### Ejemplo de error de validación

Django:

    {
        "titulo": ["Titulo is a mandatory field. Cannot be undefined or null"]
    }

---

## 🗄️ Base de datos

| Aspecto | Node | Django |
|---------|------|--------|
| Schema | ensamblia | public (cambio) |
| Gestión | SQL manual | Django ORM + migraciones |
| Tablas | Mismas | Mismas (con nombres idénticos) |
| Columnas | Mismas | Mismas |
| usuario | nickname + password_hash | nickname + password_hash + is_staff + is_superuser + is_active + last_login |
| administrador | Tabla propia | ❌ Eliminada → Django auth |

### Cambios en columnas

- tipo_anuncio.tipo → renombrado a tipo_anuncio.nombre en DB, se serializa como `tipo` al front.
- tipo_archivo.mime_type → ampliado de VARCHAR(15) a VARCHAR(100).
- Timestamps: todos timestamp with time zone, USE_TZ=True, TIME_ZONE=UTC.
- IDs: bigint GENERATED ALWAYS AS IDENTITY (equivalente a BigAutoField).
- Añadidos is_staff, is_superuser, is_active, last_login a usuario.
- Eliminada tabla administrador.

---

---

## 🧩 Serializers con FK

Node usaba queries manuales con `xxx_id`. Django requiere declarar explícitamente los campos FK si el nombre de la columna no coincide con el nombre del campo.

### Regla

Si el modelo tiene:

    campo = ForeignKey(Modelo, db_column='campo_id')

El serializer debe declarar:

- Output: `campo_id = serializers.IntegerField(read_only=True)`
- Input: `campo_id = serializers.PrimaryKeyRelatedField(source='campo', queryset=...)`

Si no, DRF devuelve null silenciosamente.

Esto ya está aplicado en todos los serializers del proyecto.

### Excepción

Si la FK es primary_key del modelo (como en las tablas pivote `perfil_chat`, `perfil_grupo`, etc.), no hace falta declararla porque Django expone automáticamente el atributo `xxx_id`.

---

## 🐳 Docker

| Aspecto | Node | Django |
|---------|------|--------|
| Contenedor PostgreSQL | ensamblia_db | Igual |
| Puerto | 5434 | Igual |
| pgAdmin | pgadmin_ensamblia en 8081 | Igual |
| Base de datos | EMNSAMBLIA_DB | Igual |

---

## 🌐 Frontend (React)

El front NO necesita cambios salvo:

1. Los mensajes de error de auth ahora vienen en `detail`, no en `mensaje`.
2. Si el front comprobaba 404 para "lista vacía", ahora recibirá 200 con [].

Todo lo demás (nombres de campos, paths, métodos HTTP, códigos) es idéntico.

### Cómo verificar que el front sigue funcionando

1. Arranca el backend:

        python manage.py runserver

2. Arranca el frontend:

        cd frontend
        npm run dev

3. Comprueba que:
   - Login funciona
   - Registro funciona
   - Listado de anuncios carga
   - Crear anuncio funciona
   - Perfiles cargan
   - Chat funciona

Si algo falla, el 99% de las veces es porque el front esperaba un mensaje de error en `mensaje` y ahora está en `detail`.

---

## 🚦 Comandos útiles

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

---

## 🎯 Resumen ejecutivo

| Aspecto | Compatible con front |
|---------|:--------------------:|
| Paths de endpoints | ✅ |
| Nombres de campos JSON | ✅ |
| Métodos HTTP | ✅ |
| Estructura de recursos | ✅ |
| Código HTTP éxito | ✅ |
| Código HTTP lista vacía | ⚠️ 404 → 200 |
| Formato error validación | ⚠️ Cambiado |
| Formato error auth | ⚠️ `mensaje` → `detail` |
| JWT formato | ✅ |

### Acción requerida en el front

Solo 1 cambio obligatorio:

- Revisar cómo el front maneja los errores de autenticación. Si lee `error.mensaje`, cambiarlo a `error.detail`.

### Acción opcional en el front

- Aprovechar que las listas vacías ahora devuelven 200 con [] en lugar de 404. Simplifica el código.

---

## 🔧 Troubleshooting

### Error: "connection timeout expired"

- Verifica que Docker está corriendo:

      docker ps

- Verifica que `DB_HOST=127.0.0.1` (no localhost) en `.env`.
- Verifica que el contenedor `ensamblia_db` está activo.

### Error: "Token is invalid"

- Revisa que el token se envía como `Authorization: Bearer <token>`.
- No uses la pestaña "Auth" de Postman; usa la pestaña "Headers" manualmente.
- Asegúrate de no copiar saltos de línea al pegar el token.

### Error: "column xxx does not exist"

- Alguna migración no está aplicada. Ejecuta:

      python manage.py showmigrations
      python manage.py migrate

### Error: "relation xxx does not exist"

- La base de datos está vacía o desincronizada. Revisa:

      python manage.py migrate

---

## 👥 Equipo

Proyecto final

- Maite
- Marga
- Raquel
- Luis

---

