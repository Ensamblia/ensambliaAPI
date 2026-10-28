import api from './axios';

// tipo y genero pueden ir repetidos (?tipo=sala&tipo=bar): sin corchetes.
const paramsSerializer = { indexes: null };

export async function buscarLocales(params = {}) {
  const res = await api.get('/locales/', { params, paramsSerializer });
  return res.data;
}

export async function getLocal(perfilId) {
  const res = await api.get(`/locales/${perfilId}/`);
  return res.data;
}

export async function guardarLocal(perfilId, datos) {
  const res = await api.put(`/locales/${perfilId}/`, datos);
  return res.data;
}

export async function getArtistasSugeridos(perfilId, params = {}) {
  const res = await api.get(`/locales/${perfilId}/artistas-sugeridos/`, {
    params,
    paramsSerializer,
  });
  return res.data;
}
