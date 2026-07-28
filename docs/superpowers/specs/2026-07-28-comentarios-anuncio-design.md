# Comentarios en anuncios — diseño

## Contexto

El backend de `comentario` ya existe y está protegido (`GET /api/comentarios/anuncio?anuncio_id=`, `POST/PUT/DELETE /api/comentarios` con `authMiddleware` + comprobación de dueño por `perfil_id`). El frontend no tiene ninguna pantalla que los use. Tampoco existe una página de detalle de anuncio: `AnunciosPage` solo lista `AnuncioCard`, y el "Ver más →" de cada card es un `<span>` sin `onClick`.

`GET /api/anuncios/:id` y `GET /api/perfiles/:id` ya son públicos, así que no hace falta tocar el backend para esta feature.

## Alcance

- Página de detalle de anuncio en `/anuncios/:id`, que hace que "Ver más →" funcione de una vez.
- Comentarios: crear, listar, editar (solo los míos), borrar (solo los míos). No hay moderación ni comentarios anidados.

## Componentes nuevos

### `AnuncioDetailPage` (`frontend/src/pages/AnuncioDetailPage.jsx`)
- Ruta `/anuncios/:id`, registrada en `AppRouter.jsx`.
- Carga el anuncio con `GET /api/anuncios/:id` (loading/error states igual que `AnunciosPage`; si 404, reutilizar el mismo patrón visual de "no encontrado" o remitir a `NotFoundPage`).
- Muestra el anuncio completo (sin recortar contenido, a diferencia de la card).
- Monta `<Comentarios anuncioId={anuncio.anuncio_id} />` debajo.

### `Comentarios` (`frontend/src/components/comentarios/Comentarios.jsx`)
Autocontenido — recibe solo `anuncioId`, no depende de que el padre le pase nada de perfil.

**Al montar:**
- `GET /api/comentarios/anuncio?anuncio_id=<id>` → lista de comentarios (backend ya los ordena `DESC` por fecha). Si 404 (sin comentarios), lista vacía, no es error.
- Si hay sesión (`AuthContext.user`), `GET /api/perfiles/me` para saber mi `perfil_id`. Si devuelve 404 (usuario sin perfil creado todavía), `miPerfilId = null` — no se rompe nada, simplemente no se muestran controles de edición y el formulario de comentar mostrará el aviso de "crea tu perfil" en cuanto se intente publicar.

**Nombres de autor:**
- Por cada `perfil_id` distinto presente en los comentarios, `GET /api/perfiles/:id`, cacheado en un `Map` en el estado del componente para no repetir la petición si varios comentarios son del mismo perfil.

**Crear comentario:**
- Formulario simple (textarea + botón) debajo de la lista.
- Sin sesión → en vez del formulario, aviso "Inicia sesión para comentar" con link a `/login`.
- Con sesión, al enviar: `POST /api/comentarios` con `{ contenido, anuncio_id }`.
  - Si responde 403 con el mensaje del backend ("Necesitas crear tu perfil antes de comentar"), se muestra tal cual.
  - Si responde 201, el comentario nuevo se antepone a la lista local (sin recargar todo), y se limpia el textarea.

**Editar (solo comentarios propios, `comentario.perfil_id === miPerfilId`):**
- Botón "Editar" convierte el texto del comentario en un `<textarea>` inline con "Guardar"/"Cancelar".
- Guardar → `PUT /api/comentarios/:id` con `{ contenido }`. Al responder 201, se reemplaza el comentario en la lista con la respuesta del backend. Cancelar descarta el cambio sin llamar a la API.

**Borrar (solo comentarios propios):**
- Botón "Borrar" con `window.confirm` de confirmación → `DELETE /api/comentarios/:id` → se quita de la lista local al confirmar éxito.

## Cambios en archivos existentes

- `AppRouter.jsx`: añadir `<Route path="/anuncios/:id" element={<AnuncioDetailPage />} />`.
- `AnuncioCard.jsx`: el `<span>` "Ver más →" pasa a ser navegable (`onClick` → `navigate('/anuncios/' + anuncio.anuncio_id)`, o envolver en `<Link>`), sin cambiar el resto del diseño de la card.

## Manejo de errores

Sigue el mismo patrón que ya usa `AnuncioCard.handleContactar`: 401 → redirige a `/login`; 403 → mensaje inline específico del backend; resto → mensaje genérico. Nada de esto necesita cambios en el backend.

## Fuera de alcance (explícitamente, no en esta iteración)

- Comentarios anidados/respuestas.
- Moderación o borrado por terceros (eso lo cubre la feature de admin, por separado).
- Contador de comentarios en `AnuncioCard` de la lista (podría añadirse después sin tocar este diseño).
