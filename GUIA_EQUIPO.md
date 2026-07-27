# 🎵 Guía Completa de Incorporación al Proyecto Ensamblia

¡Bienvenido/a al equipo de desarrollo de **Ensamblia**! 
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

> ⚠️ **IMPORTANTE**: el archivo `.env` **ya no se sube al repositorio** (antes se subía por error, con contraseñas reales incluidas). Cada persona del equipo tiene su propio `.env` en local, y nunca se hace `git add .env`. En el repo solo encontrarás `.env.example`, que es la plantilla sin valores reales.

1. En la raíz del repositorio (`ensambliaAPI`), copia la plantilla a tu propio `.env`:
   ```bash
   cp .env.example .env
   ```
   *(en Windows/PowerShell: `copy .env.example .env`)*

2. Rellena las variables en tu `.env` local:
   ```env
   PORT=3000
   DB_PORT=5434
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=          # pídesela a un compañero por privado (Discord/WhatsApp del equipo), no está en el repo
   DB_NAME=EMNSAMBLIA_DB

   JWT_SECRET=           # genera el tuyo propio, no hace falta que coincida con el de nadie más
   JWT_EXPIRES_IN=2h
   ```

   Para generar tu `JWT_SECRET`, ejecuta esto una vez en tu terminal y pega el resultado:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   No es necesario compartir este valor con nadie: cada backend local firma y valida sus propios tokens, así que el `JWT_SECRET` de cada persona puede (y debe) ser distinto.

3. Instala las dependencias del backend (solo la primera vez):
   ```bash
   npm install
   ```
4. Arranca el servidor del backend:
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

### 🔐 5.2 Autenticación (Login / Registro)

Ya existen las vistas de inicio de sesión y registro, conectadas de verdad al backend:

- `frontend/src/pages/LoginPage.jsx` → `POST /api/auth/login`
- `frontend/src/pages/RegisterPage.jsx` → `POST /api/auth/register`

**¿Cómo se guarda la sesión?**
- `frontend/src/context/AuthContext.jsx` guarda `{ usuario, token }` en `localStorage` (claves `ensamblia_token` y `ensamblia_usuario`) y expone `login(usuario, token)` / `logout()` a través de `useContext(AuthContext)`.
- La sesión sobrevive a un refresh de la página (se lee de `localStorage` al arrancar la app).
- `frontend/src/api/axios.js` añade automáticamente la cabecera `Authorization: Bearer <token>` a **todas** las peticiones si hay sesión activa, así que no hace falta añadirla a mano en cada llamada nueva.
- `frontend/src/components/navbar/Navbar.jsx` muestra el nombre de usuario + botón "Cerrar sesión" cuando hay sesión, o el enlace "Iniciar sesión" cuando no la hay.
- `frontend/src/App.jsx` envuelve toda la app en `<AuthProvider>` — si creas otro punto de entrada, recuerda envolverlo también.

**Importante:** de momento no hay rutas protegidas (por ejemplo, `/perfil` es visible sin haber iniciado sesión). Si tu tarea necesita proteger una ruta, pregunta antes de implementarlo para no pisar el trabajo de otra persona.

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
3. Ve a GitHub y abre un **Pull Request (PR)** hacia la rama `Marga-front` para que el equipo revise e integre tu trabajo.

