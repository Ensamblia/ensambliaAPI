# Rol admin (anuncio + usuario) — diseño

## Contexto

El sistema de permisos actual es puramente de propiedad: cada controller protegido comprueba `algo.perfil_id !== miPerfilId → 403`. No existe ningún concepto de rol ni de "admin" en ningún sitio — ni columna en `usuario`, ni bypass en ningún controller. Tampoco existe hoy ninguna ruta para listar/editar/borrar usuarios: `usuarioModel.js` solo tiene `getUser`/`createUser`, usados exclusivamente por `authController` (login/registro). No hay `usuarioController.js` ni `usuarioRoutes.js`.

## Alcance

Un rol `es_admin` que permite:
1. Editar o borrar **cualquier** anuncio (no solo el propio).
2. Listar, editar y borrar **cualquier** usuario (funcionalidad que hoy no existe para nadie).

Explícitamente **fuera de alcance** (confirmado con el usuario): el bypass de admin NO aplica a otras entidades (perfil, comentario, chat, mensaje, multimedia, grupo...). Esas siguen exactamente igual que hoy, solo "puedes tocar lo tuyo".

## Cambios de base de datos

Sin sistema de migraciones en el repo — se aplica directo sobre el contenedor `ensamblia_db`:

```sql
ALTER TABLE ensamblia.usuario ADD COLUMN es_admin boolean NOT NULL DEFAULT false;
```

## Backend

### Auth
- `usuarioModel.getUser`: el `SELECT` pasa a incluir también `es_admin`.
- `authController.login`: el payload del JWT (`jwt.sign(...)`) incluye `es_admin: usuarioDb.es_admin`.
- `authController.register`: usuarios nuevos quedan con `es_admin = false` por el `DEFAULT` de la columna; no hace falta tocar el INSERT. El payload del JWT que se firma al registrar incluye explícitamente `es_admin: false`, igual que login.
- `authMiddleware` no cambia: ya vuelca el payload completo del JWT en `req.usuario`, así que `req.usuario.es_admin` queda disponible sin tocar el middleware.
- Nuevo middleware `requireAdmin`, en un archivo propio `src/controllers/middlewares/adminMiddleware.js` (mismo patrón que `authMiddleware.js`, un archivo por middleware): si `!req.usuario?.es_admin` → `403 { error: "Requiere permisos de administrador" }`. Se usa siempre **después** de `authMiddleware` en la cadena de una ruta (para que `req.usuario` ya exista).

### `anuncioController` — bypass de dueño
En `updateAnuncio` y `deleteAnuncio`, la comprobación pasa de:
```js
if (existente.perfil_id !== miPerfilId) { return res.status(403)... }
```
a:
```js
if (existente.perfil_id !== miPerfilId && !req.usuario.es_admin) { return res.status(403)... }
```
`createAnuncio` no cambia — crear ya funciona igual para cualquier usuario con perfil propio; lo nuevo es poder tocar el anuncio de **otro**.

### CRUD de `usuario` (nuevo)

**`usuarioModel.js`** — añadir junto a `getUser`/`createUser`:
- `getUsuarios()` — `SELECT usuario_id, usuario, es_admin, creado_en FROM ensamblia.usuario` (nunca `password_hash`).
- `getById(id)` — mismas columnas, `WHERE usuario_id = $1`.
- `updateUsuario(updates, values)` — mismo patrón dinámico que `perfilModel`/`comentarioModel` (`UPDATE ... SET ${updates.join(', ')} WHERE usuario_id = $N RETURNING usuario_id, usuario, es_admin, creado_en`).
- `deleteUsuario(id)` — `DELETE ... WHERE usuario_id = $1 RETURNING usuario_id, usuario`.

**`usuarioController.js`** (nuevo):
- `getUsuarios` — lista completa.
- `getById` — por id.
- `updateUsuario` — body acepta `usuario` (nombre), `password` (se re-hashea con bcrypt antes de guardar como `password_hash`) y `es_admin` (booleano), todos opcionales, **al menos uno obligatorio** (mismo patrón de validación que `updateComentario`/`updatePerfil`). Permite que un admin cambie el `es_admin` de otro usuario (ascender o degradar).
- `deleteUsuario` — borra por id. Si el usuario tiene un `perfil` vinculado, la FK (`fk_perfil_usuario_id`, sin `ON DELETE CASCADE`) hace que Postgres rechace el borrado; eso cae de forma natural en el catch genérico ya estandarizado (`console.error` + `500 "Error interno del servidor"`) — mismo comportamiento que cualquier otro borrado con dependencias en este repo, no requiere manejo especial.
- Todas las funciones siguen el mismo try/catch genérico que el resto de controllers.

**`usuarioRoutes.js`** (nuevo), montado en `/api/usuarios` desde `app.js`:
```js
router.get('/',      authMiddleware, requireAdmin, usuarioController.getUsuarios)
router.get('/:id',   authMiddleware, requireAdmin, usuarioController.getById)
router.put('/:id',   authMiddleware, requireAdmin, usuarioController.updateUsuario)
router.delete('/:id',authMiddleware, requireAdmin, usuarioController.deleteUsuario)
```
Todas las rutas son admin-only, sin excepción — nadie puede listar/ver/editar/borrar usuarios si no es admin, ni siquiera su propio registro (para eso ya existe `GET /api/perfiles/me`, que es sobre `perfil`, no sobre `usuario`).

## Bootstrap del primer admin (autoservicio, sin tocar la BD a mano)

Para que el usuario pueda crearse su propio admin desde la app (sin que nadie le edite la BD a mano), el registro acepta una clave secreta:

- Nueva variable de entorno `ADMIN_BOOTSTRAP_KEY` en `.env` (y placeholder vacío en `.env.example`), elegida por cada persona en su entorno local — igual que `JWT_SECRET`, nunca se sube al repo.
- `authController.register` acepta un campo opcional `admin_key` en el body. Si `process.env.ADMIN_BOOTSTRAP_KEY` está definida y `admin_key === process.env.ADMIN_BOOTSTRAP_KEY`, el usuario se crea con `es_admin = true`. En cualquier otro caso (clave ausente, incorrecta, o variable no configurada), se crea como usuario normal — **sin devolver ningún error ni pista de si la clave era correcta**, para no dar información a quien intente adivinarla por fuerza bruta.
- `usuarioModel.createUser` pasa a aceptar `es_admin` como tercer parámetro (`INSERT INTO ... (usuario, password_hash, es_admin) VALUES ($1, $2, $3) RETURNING usuario_id, usuario, es_admin, creado_en`).
- El JWT que se firma en `register` incluye el `es_admin` real resultante (no siempre `false`).

## Frontend

- `RegisterPage.jsx`: campo opcional adicional "Clave de administrador (opcional)" — un input de contraseña normal, sin validación especial en el front (la valida el backend). Se envía como `admin_key` en el `POST /api/auth/register` solo si no está vacío.
- Una UI completa de gestión de usuarios (listar/editar/borrar desde el front) sigue **fuera de alcance** de esta iteración — el resto de `/api/usuarios` se prueba con curl/Postman por ahora. Lo único que cambia de "fuera de alcance" es la creación del primer admin, que ahora sí es autoservicio desde `RegisterPage`.

## Usuario de prueba

Se crea `test_admin` desde la propia app (`POST /api/auth/register` con `admin_key` correcta), no con un `UPDATE` manual en la BD. Se documentan las credenciales igual que `test_user1`/`test_user2` en `GUIA_EQUIPO.md`.

## Fuera de alcance (explícito)

- Bypass de admin en perfil, comentario, chat, mensaje, multimedia, grupo, etc.
- UI de administración en el frontend.
- Recuperación/reseteo de contraseña propia (fuera del alcance de "admin gestiona usuarios").
