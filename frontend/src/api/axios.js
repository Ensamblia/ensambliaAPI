import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

if (import.meta.env.MODE === 'test') {
  api.defaults.adapter = 'http';
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ensamblia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Añadir barra final a todas las URLs (excepto si ya la tienen o si tienen query params)
api.interceptors.request.use((config) => {
  if (config.url && !config.url.includes('?') && !config.url.endsWith('/')) {
    config.url = `${config.url}/`;
  }
  return config;
});

/**
 * Extrae la lista de resultados de una respuesta DRF.
 * Soporta:
 *   - Respuestas paginadas: { count, next, previous, results: [...] }
 *   - Respuestas planas: [...]
 *   - Respuestas nulas/undefined: devuelve []
 *
 * @param {Object|Array} res - La respuesta de axios o los datos directamente.
 * @returns {Array}
 */

// ── Response interceptor: 401 → logout global ──
// Si el token caduca, el back devuelve 401. Emitimos un evento que
// AuthProvider escucha para limpiar la sesión. La redirección a /login
// la hace RequireAuth (AppRouter) al detectar user=null, así evitamos
// bucles y acoplamiento con react-router.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const hasAuthHeader = Boolean(error?.config?.headers?.Authorization);

    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && hasAuthHeader && !isAuthEndpoint) {
      // Limpieza directa (por si AuthProvider no está montado, p. ej. en tests).
      try {
        localStorage.removeItem('ensamblia_token');
        localStorage.removeItem('ensamblia_usuario');
      } catch {
        // localStorage puede fallar en SSR/entornos raros; no rompemos.
      }
      // Aviso a la app. AuthProvider lo escucha y hace logout().
      try {
        window.dispatchEvent(new Event('auth:unauthorized'));
      } catch {
        // window puede no existir en SSR; no rompemos.
      }
    }

    return Promise.reject(error);
  },
);

export function extractList(res) {
  const data = res?.data ?? res;
  return data?.results ?? (Array.isArray(data) ? data : []) ?? [];
}

/**
 * Extrae un mensaje de error legible de un error de axios.
 * Acepta los formatos que devuelve el back:
 *   - { detail: "..." }                (DRF estándar: auth, permisos)
 *   - { error: "..." }                 (vistas custom)
 *   - { message: "..." }               (auth register: "Username in use")
 *   - { campo: ["..."] }               (validación DRF)
 *   - Errores de red: sin response
 *
 * @param {unknown} err
 * @param {string} [fallback='Ha ocurrido un error']
 * @returns {string}
 */
export function parseApiError(err, fallback = 'Ha ocurrido un error') {
  if (!err) return fallback;

  // Error de red (sin response)
  if (!err.response) {
    return err.message || fallback;
  }

  const data = err.response.data;

  if (typeof data === 'string' && data.trim()) return data;

  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    if (typeof data.message === 'string' && data.message.trim()) return data.message;

    // Errores de validación: { campo: ["msg", ...] }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const value = data[firstKey];
      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (typeof value === 'string' && value.trim()) return value;
    }
  }

  return fallback;
}


export default api;