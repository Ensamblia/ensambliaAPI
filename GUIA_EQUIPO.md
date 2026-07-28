# 🎵 Guía Completa del Proyecto Ensamblia

¡Hola compis de **Ensamblia**! 
Esta guía contiene **todo lo que necesitas saber** para entender la arquitectura de la aplicación, configurar tu entorno local y empezar a desarrollar sin pisar el trabajo de otros compañeros.

---

## 🧭 1. ¿Qué es Ensamblia y cuáles son sus partes?

Ensamblia es una plataforma web para conectar músicos, bandas y amantes de la música (ofertas de trabajo/servicios, búsqueda de integrantes, alquiler de salas de ensayo, compra/venta de instrumentos, etc.).

La arquitectura del sistema está dividida en **3 partes independientes**:

```
+-------------------------------------------------------------------+
|                           Navegador Web                           |
+-------------------------------------------------------------------+
       |                                           |
       v (Peticiones HTTP / JSON)                  v (Administración BD)
+-------------------------------+       +---------------------------+
|    Frontend (React.js + Vite) |       |          pgAdmin          |
|    http://localhost:5173      |       |   http://localhost:5050   |
+-------------------------------+       +---------------------------+
               |                                     |
               v (API REST)                          v (SQL)
+-------------------------------+       +---------------------------+
|   Backend (Node.js + Express) | ----> |   Base de Datos PostgreSQL|
|    http://localhost:3000      |       |   Docker (Puerto 5434)    |
+-------------------------------+       +---------------------------+
```

### 1.1 Base de Datos (PostgreSQL en Docker)
- Almacena las tablas de `usuario`, `perfil`, `instrumento`, `genero_musical`, `anuncio`, `tipo_anuncio`, `chat`, `mensaje`, `comentario`, etc.
- Se ejecuta aislada dentro de **Docker** para que todos los desarrolladores tengamos exactamente la misma base de datos sin instalar PostgreSQL en el ordenador.

### 1.2 Backend (API REST en Node.js + Express)
- Código situado en la carpeta raíz del repositorio (`src/`).
- Escucha peticiones en `http://localhost:3000/api`.
- Contiene los modelos (`src/models/`), las rutas (`src/routes/`) y la lógica de base de datos para responder en formato JSON al frontend.

### 1.3 Frontend (Aplicación React.js)
- Código situado en la subcarpeta `frontend/`.
- Escucha en `http://localhost:5173`.
- Es la interfaz web donde el usuario interactúa (navega entre anuncios, edita su perfil de músico y envía mensajes en el chat).

---

## ⚡ 2. Requisito Obligatorio: Docker Desktop

> ⚠️ **MUY IMPORTANTE**: Antes de ejecutar cualquier comando para arrancar la base de datos, **debes abrir y tener ejecutándose la aplicación Docker Desktop** en tu equipo. Si Docker no está encendido, la conexión a la base de datos fallará.

---

## 🌿 3. Flujo de Git y Ramas (¡Muy Importante para Trabajar en Equipo!)

**Nadie debe trabajar directamente sobre la rama `main` ni sobre la rama `Marga-front`**. 

La rama `Marga-front` sirve como **rama base integrada del frontend**. Cada miembro creará su propia rama para desarrollar su funcionalidad:

```
                          (Tu rama de trabajo)
                     /---> git checkout -b mi-nombre/funcionalidad ---> Pull Request
                    /
origin/Marga-front (Rama base)
```

### Pasos para iniciar tu rama:
1. Descarga los últimos cambios de la rama base:
   ```bash
   git fetch origin
   git checkout Marga-front
   git pull origin Marga-front
   ```
2. Crea **tu propia rama de trabajo**:
   ```bash
   # Ejemplo si te llamas Carlos y vas a hacer la vista de Login:
   git checkout -b carlos/login-page
   ```

---


## 🛠️ 4. Guía Paso a Paso para Levantar el Proyecto Localmente

### Paso 1: Encender la Base de Datos y pgAdmin (Docker)
1. Abre la aplicación **Docker Desktop**.
2. En la terminal de la raíz del proyecto, ejecuta:
   ```bash
   docker-compose up -d
   ```
3. **Acceso a pgAdmin (Panel de Administración de la BD)**:
   - Abre tu navegador y entra a `http://localhost:5050`.
   - Inicia sesión con el correo/clave configurado en pgAdmin.
   - Crea una conexión a servidor con estos datos:
     - **Host**: `localhost` (o nombre del servicio docker)
     - **Puerto**: `5434`
     - **Usuario**: `root`
     - **Contraseña**: `ensamblia2026`
     - **Base de Datos**: `EMNSAMBLIA_DB`

---

### Paso 2: Encender el Backend (API Express)
1. En la raíz del repositorio (`ensambliaAPI`) copia la plantilla `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   `.env.example` **sí está en el repo** (es solo la plantilla, sin secretos reales) y trae ya las variables que necesitas: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN` y las opcionales de admin (`ADMIN_BOOTSTRAP_KEY`, etc.). Rellena `DB_PASSWORD` y `JWT_SECRET` con tus propios valores (pídeselos a quien lleve la BD si no los tienes).

   > ⚠️ **`.env` nunca se sube.** Está en `.gitignore` a propósito porque lleva contraseñas y claves reales — jamás hagas `git add .env` ni fuerces su commit. Si añades una variable nueva en el futuro, añádela también (vacía o con un comentario) a `.env.example` para que el resto del equipo sepa que existe, pero sin el valor real.
2. Instala las dependencias del backend (solo la primera vez):
   ```bash
   npm install
   ```
3. Arranca el servidor del backend:
   ```bash
   npm run dev
   ```
   *(Quedará ejecutándose en http://localhost:3000)*.

---

### Paso 3: Encender el Frontend (React.js)
1. Abre **otra ventana de la terminal** y entra a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del frontend (solo la primera vez):
   ```bash
   npm install
   ```
3. Arranca la aplicación de React:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en `http://localhost:5173`.

---

## 📂 5. Estructura de Archivos del Frontend (`frontend/src/`)

Cuando vayas a crear componentes o páginas en React, respeta la siguiente estructura de carpetas:

- `src/api/axios.js`: Instancia de Axios configurada para conectarse al backend (`http://localhost:3000/api`).
- `src/components/`: Componentes reutilizables:
  - `navbar/`: Barra de navegación pública y privada.
  - `cards/`: Tarjetas visuales de anuncios y músicos.
  - `filters/`: Buscadores por instrumento, género y localización.
  - `chat/`: Ventanas de conversación y mensajes.
- `src/context/AuthContext.jsx`: Estado global para guardar el usuario logueado.
- `src/pages/`: Vistas completas de la aplicación (`HomePage`, `AnunciosPage`, `PerfilPage`, `ChatPage`).
- `src/router/AppRouter.jsx`: Enrutador principal del frontend (React Router).

---

### 🔗 5.1 Conexión Frontend ↔ Backend (Ejemplo de Integración)

La aplicación cliente (React) se comunica con el servidor de la API Node.js/Express a través de **Axios**.

1. **Cliente HTTP Configurado** ([frontend/src/api/axios.js](file:///c:/Users/User/Documents/repositorios/ensambliaAPI/frontend/src/api/axios.js)):
   ```javascript
   import axios from 'axios';

   const api = axios.create({
     baseURL: 'http://localhost:3000/api',
     headers: {
       'Content-Type': 'application/json',
     },
   });

   export default api;
   ```

2. **Ejemplo de consumo en vistas React** (Consumiendo `/api/anuncios` en [frontend/src/pages/AnunciosPage.jsx](file:///c:/Users/User/Documents/repositorios/ensambliaAPI/frontend/src/pages/AnunciosPage.jsx)):
   ```javascript
   import React, { useEffect, useState } from 'react';
   import api from '../api/axios';
   import { AnuncioCard } from '../components/cards/AnuncioCard';

   export function AnunciosPage() {
     const [anuncios, setAnuncios] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       api.get('/anuncios')
         .then((res) => {
           setAnuncios(res.data);
           setLoading(false);
         })
         .catch((err) => {
           console.error(err);
           setLoading(false);
         });
     }, []);

     return (
       <div>
         <h1>Anuncios de Músicos y Servicios</h1>
         {loading ? <p>Cargando...</p> : anuncios.map(a => <AnuncioCard key={a.id} anuncio={a} />)}
       </div>
     );
   }
   ```

---

## 📤 6. ¿Cómo guardar y subir tus avances?

Una vez que pruebes que tus cambios funcionan correctamente en local:

1. Añade y guarda tus cambios en tu rama:
   ```bash
   git add .
   git commit -m "feat: agrego el componente formulario de login"
   ```
2. Sube tu rama al servidor remoto en GitHub:
   ```bash
   git push -u origin tu-nombre/tu-funcionalidad
   ```
3. Ve a GitHub y abre un **Pull Request (PR)** hacia la rama `Marga-front` para que Luis lo revise e integre tu trabajo.

---

## 🧵 7. Para Luis: qué se ha hecho en `auth-rutas-protegidas` (resumen completo)

Esta rama ya está **integrada con tus últimos cambios de `main` y probada de verdad contra la base de datos** (registro, login, permisos, y los distintos roles). Está en `origin/auth-rutas-protegidas`, al día con `origin/main` (incluye tus PR #36-#39: validators, authMiddleware, grupo/tipo_archivo/multimedia/perfil_grupo). Queda en tus manos decidir cuándo la integras en `main` — no he tocado `main` en ningún momento.

Esto es todo lo que trae, para que lo repases de una vez sin sorpresas:

**Autenticación y roles**
- Login/registro con JWT (`POST /api/auth/register`, `POST /api/auth/login`), `authMiddleware` verificando el token en cada ruta protegida.
- Rol de administrador (`es_admin` en `usuario`): puede editar/borrar cualquier anuncio y gestionar cualquier usuario en `/api/usuarios` (CRUD admin-only vía `adminMiddleware`). Te haces admin registrándote con un `admin_key` que coincida con `ADMIN_BOOTSTRAP_KEY` del `.env` — es un bootstrap deliberado, no hay pantalla para "ascender" a alguien después.

**Protección de datos (ownership)**
- `perfil`, `anuncio`, `comentario`, `chat`/`mensaje`/`mensaje_leido`, `perfil_chat`, `multimedia` y `perfil_grupo`: cada uno comprueba que quien edita/borra sea el dueño del recurso (vía `perfil_id` derivado del usuario autenticado, nunca del body). Antes de esto, cualquiera con el `id` en la URL podía tocar datos ajenos.
- Catálogos (`ciudad`, `comarca`, `genero_musical`, `instrumento`, `tipo_anuncio`, `grupo_genero`, `grupo`, `tipo_archivo`) con lectura pública y escritura protegida (cualquier usuario logueado puede escribir, no solo admin — así estaba diseñado, decidir si eso se queda así es cosa vuestra).
- Los errores 500 ya no filtran el objeto de error de Postgres crudo (`name`/`code`/`detail`/`hint`) al cliente; se responde con un mensaje genérico y el detalle solo va a consola del servidor.

**Funcionalidades nuevas**
- CRUD completo de `grupo`, `tipo_archivo`, `multimedia`, `perfil_grupo` (esta última tabla ya existía en la BD sin API).
- `POST /api/chats/con/:perfil_id`: abre (o reutiliza) un chat 1:1 con el autor de un anuncio — usado por el botón "Contactar" en `AnuncioCard`.
- Comentarios en anuncios: CRUD completo, solo el autor edita/borra los suyos. Página de detalle de anuncio nueva (`/anuncios/:id`) que los muestra.
- Página 404 real (antes una ruta no encontrada redirigía en silencio a `/`).

**Frontend**
- `AuthContext` persistido en `localStorage`, navbar condicional según sesión, `PerfilPage` y `ChatBox` con datos reales (antes eran mocks).
- Páginas nuevas: `AnuncioDetailPage` (con comentarios), `NotFoundPage`. Campo de clave admin en `RegisterPage`.

**Entorno**
- `nodemon` está roto en este equipo (symlink relativo en `node_modules/.bin`) — usa `node src/app.js` directo si te pasa lo mismo; reinstalar `node_modules` también lo arregla.
- `.env.example` en el repo trae ya todas las variables necesarias (`JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_BOOTSTRAP_KEY` incluidas) — copia a `.env` y rellena tus valores, nunca subas `.env` (ver sección 4).

**Usuarios de prueba** (creados por el flujo normal de `/api/auth/register`, nada tocado a mano en la BD):

| usuario | password | es_admin |
|---|---|---|
| `test_user1` | `Test1234!` | no |
| `test_user2` | `Test1234!` | no |
| `test_admin` | `AdminTest1234!` | sí |

El único usuario "real" que había antes en la tabla (`Luis Huertas`) tiene la contraseña hasheada — si es la tuya y la necesitas, tendrás que resetearla o registrar una nueva.

### 📌 Qué queda pendiente
- **UI de grupos/bandas**: `grupo`, `grupo_genero`, `perfil_grupo` tienen API completa pero cero pantalla en el front.
- **UI de multimedia**: `multimedia`/`tipo_archivo` con CRUD pero sin forma de subir un archivo real desde el navegador (`ruta_archivo` es hoy un string que hay que rellenar a mano, no hay subida de ficheros de verdad — ver sección 9).
- **UI de administración**: `/api/usuarios` (admin-only) se prueba con curl/Postman, no tiene pantalla.
- **"Diseño & UI/UX avanzada"**: sigue marcado como pendiente en el README — ver sección 10 para propuestas concretas.

---

## 🗺️ 8. Mapa actual de la aplicación

### Backend — entidades y endpoints (`/api/...`)

| Recurso | Mount | Lectura | Escritura | Notas |
|---|---|---|---|---|
| Auth | `/api/auth` | — | pública | `register`, `login`. Sin esto no funciona nada más. |
| Usuarios | `/api/usuarios` | admin | admin | Gestión de cuentas, solo `es_admin`. |
| Perfiles | `/api/perfiles` | pública (`/me` requiere token) | dueño | El perfil musical de cada usuario. |
| Anuncios | `/api/anuncios` | pública | dueño (o admin) | Ofertas/demandas (banda busca músico, venta de equipo, etc.). |
| Comentarios | `/api/comentarios` | pública | dueño | Comentarios en anuncios. |
| Chats | `/api/chats` | **solo autenticado** | dueño | Conversaciones 1:1. |
| Mensajes | `/api/mensajes` | **solo autenticado** | dueño | Mensajes dentro de un chat. |
| Mensajes leídos | `/api/mensaje-leidos` | **solo autenticado** | dueño | Marca de lectura por mensaje/perfil. |
| Perfil-Chat | `/api/perfil-chats` | **solo autenticado** | dueño | Relación perfil↔chat (quién participa en qué). |
| Grupos | `/api/grupos` | pública | logueado | Bandas/grupos musicales. |
| Perfil-Grupo | `/api/perfil-grupos` | pública | dueño | Qué perfil pertenece a qué grupo. |
| Multimedia | `/api/multimedias` | pública | dueño | Archivos asociados a un perfil y opcionalmente a un anuncio. |
| Tipo de archivo | `/api/tipo-archivos` | pública | logueado | Catálogo (imagen, audio, vídeo...). |
| Instrumentos | `/api/instrumentos` | pública | logueado | Catálogo. |
| Perfil-Instrumento | `/api/perfil-instrumentos` | pública | dueño | Qué instrumentos toca cada perfil. |
| Géneros musicales | `/api/genero_musical` | pública | logueado | Catálogo (⚠️ único endpoint con nombre en `snake_case`/singular, el resto son kebab-case plural — vale la pena unificarlo en algún momento). |
| Perfil-Género | `/api/perfil-genero-musicales` | pública | dueño | Géneros que toca cada perfil. |
| Grupo-Género | `/api/grupo-generos` | pública | logueado | Géneros asociados a un grupo. |
| Ciudades | `/api/ciudades` | pública | logueado | Catálogo. |
| Comarcas | `/api/comarcas` | pública | logueado | Catálogo. |
| Tipo de anuncio | `/api/tipo-anuncios` | pública | logueado | Catálogo (oferta/demanda/venta...). |

"Dueño" = comprobación de propiedad real en el controller (el `perfil_id`/`usuario_id` sale del token, nunca del body/params); "logueado" = cualquier usuario autenticado puede escribir, sin comprobar dueño porque es un catálogo compartido; "admin" = requiere `es_admin`.

### Frontend (`frontend/src/`)

- **Páginas** (`pages/`): `HomePage`, `AnunciosPage` (listado + filtros), `AnuncioDetailPage` (detalle + comentarios), `PerfilPage`, `ChatPage`, `LoginPage`, `RegisterPage`, `NotFoundPage`.
- **Componentes** (`components/`, organizados por dominio): `navbar/Navbar`, `cards/AnuncioCard`, `filters/FiltrosAnuncios`, `chat/ChatBox`, `comentarios/Comentarios`.
- **Estado global**: `context/AuthContext.jsx` (usuario + token, persistido en `localStorage`).
- **Cliente API**: `api/axios.js`, instancia única con `baseURL` a `http://localhost:3000/api`.
- **Enrutado**: `router/AppRouter.jsx`, `BrowserRouter` con `Navbar` compartido, rutas no encontradas van a `NotFoundPage`.
- **Estilos**: un único `index.css` con un design system ya definido por tokens (ver sección 10) + `App.css` vacío.

---

## 📈 9. Qué se puede/debe escalar

**Backend**
- **Subida de ficheros real**: hoy `multimedia.ruta_archivo` es un string que hay que rellenar a mano; para que sea usable de verdad hace falta subida real (disco local con `multer` para empezar, o un bucket tipo S3/Cloudinary de cara a producción).
- **Paginación y filtros a nivel de BD**: los listados (`anuncios`, `perfiles`) devuelven todo de golpe; con más datos hace falta `LIMIT`/`OFFSET` o cursor-based pagination en el modelo, no filtrar en el cliente.
- **Chat en tiempo real**: hoy `mensajes` es puro REST (hay que refrescar para ver mensajes nuevos); un WebSocket (Socket.IO o `ws`) encajaría bien sin tocar el modelo de datos.
- **Rate limiting** en `/api/auth/login` y `/api/auth/register` como mínimo, para evitar fuerza bruta.
- **Tests automatizados**: ahora mismo todo se prueba a mano (curl/Postman); un mínimo de tests de integración por entidad (supertest + una BD de test) evitaría regresiones como las que hemos visto en este mismo proceso de merge.
- **Documentación de la API**: un `openapi.yaml`/Swagger generado a partir de los validators existentes serviría de contrato claro entre frontend y backend, y de referencia para nuevos miembros del equipo.
- **Búsqueda**: filtros de anuncios por texto libre hoy dependen de lo que exponga el modelo; si crece el volumen, un índice de texto (`pg_trgm`/`tsvector` en Postgres) sería el siguiente paso natural antes de pensar en Elasticsearch.
- **Notificaciones**: no hay ningún sistema de notificación (nuevo mensaje, nuevo comentario) más allá de refrescar la página.

**Frontend**
- **Gestión de estado de servidor**: hoy cada página hace su propio `useEffect` + `axios`; con React Query/TanStack Query se ganaría caché, reintentos y menos código repetido al crecer el número de pantallas.
- **Subida de archivos en el UI**: no hay ningún `<input type="file">` conectado a multimedia — es el bloqueo principal para que esa función sea usable.
- **Paginación/scroll infinito** en `AnunciosPage` cuando el backend lo soporte.
- **Accesibilidad**: revisar contraste de color y navegación por teclado (ver sección 10) antes de que la superficie de UI crezca mucho más.

**Infraestructura / proceso**
- No existe `docker-compose.yml` en el repo pese a estar referenciado en README/esta guía — formalizarlo evitaría que cada persona monte la BD "a mano" como ha pasado hasta ahora.
- CI básico (lint + arranque del backend en un job de GitHub Actions) habría detectado el bug de imports de validators antes de mergear.
- Variables de entorno por entorno (dev/staging/prod) si el proyecto pasa de local a un despliegue real.

---

## 🎨 10. Identidad visual: qué hay y cómo mejorar el CSS

**Lo que ya existe** (`frontend/src/index.css`): un pequeño design system por tokens, ya pensado y no improvisado — paleta blanco / negro carbón / coral (`--accent: #FF5C35`), tipografía Inter, escala de espaciado (`--space-1`...) y variables para superficies/bordes/texto. `App.css` está vacío; todo vive en ese único archivo. Hay `favicon.svg`, `icons.svg` y una imagen `hero.png` ya preparados; quedan sueltos `react.svg`/`vite.svg` del template por defecto de Vite que se pueden borrar.

**Si queréis mantener esta identidad** (coral/negro/blanco), lo prioritario es explotar mejor lo que ya está montado en vez de reescribirlo:
- Repartir los estilos por componente/página (CSS Modules, p. ej. `AnuncioCard.module.css`) en vez de un único `index.css` de 150+ líneas que va a crecer sin control.
- Modo oscuro "gratis": los tokens ya están centralizados en `:root`, así que añadir `@media (prefers-color-scheme: dark)` con una segunda tabla de valores es relativamente barato ahora que aún es un solo archivo.
- Revisar contraste del coral (`#FF5C35`) sobre blanco y sobre negro con una herramienta de accesibilidad (WCAG AA) antes de usarlo en texto pequeño, no solo en botones/acentos.
- Micro-interacciones: ya tenéis `lucide-react` instalado (iconos), se puede aprovechar para transiciones/estados hover consistentes en `AnuncioCard`, `Navbar`, etc.

**Si queréis pivotar a otra identidad**, la estructura por tokens ya montada sigue siendo el punto de apoyo correcto — no hay que tirarla, solo redefinir los valores de `:root` (colores, tipografía, espaciado) y todo lo que ya usa esas variables se actualiza solo. A partir de ahí:
- Definir 2-3 referencias visuales de la competencia/inspiración (algo similar a lo que ya se hizo: "Spotify · Deezer · CD Baby" según el comentario del propio `index.css`) y sacar de ahí paleta + tipografía antes de tocar código.
- Si el equipo crece o hay más pantallas por delante, valorar un sistema más estructurado (Tailwind con `theme.extend` mapeado a los mismos tokens, o una librería ligera de componentes) en vez de seguir escalando CSS plano a mano.
- Logo: hoy solo hay favicon/iconos sueltos, no hay un logotipo de marca definido — si se pivota identidad, es el momento de encargarlo/diseñarlo junto con la nueva paleta.

