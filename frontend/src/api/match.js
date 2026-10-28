import api from './axios';

export async function getMatches(params) {
  const res = await api.get('/match/', { params });
  return res.data;
}

export async function getBusquedaAnuncio(anuncioId) {
  const res = await api.get(`/match/anuncios/${anuncioId}/busqueda/`);
  return res.data;
}

export async function guardarBusquedaAnuncio(anuncioId, datos) {
  const res = await api.put(`/match/anuncios/${anuncioId}/busqueda/`, datos);
  return res.data;
}

export async function getCandidatosAnuncio(anuncioId, params = {}) {
  const res = await api.get(`/match/anuncios/${anuncioId}/candidatos/`, { params });
  return res.data;
}
