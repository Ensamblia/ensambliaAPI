import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ensamblia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
export function extractList(res) {
  const data = res?.data ?? res;
  return data?.results ?? (Array.isArray(data) ? data : []) ?? [];
}

export default api;