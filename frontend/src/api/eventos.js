import api from './axios';

// genero puede ir repetido (?genero=1&genero=2): sin corchetes
const paramsSerializer = { indexes: null };

export async function listarEventos(params = {}) {
  const res = await api.get('/eventos/', { params, paramsSerializer });
  return res.data;
}

export async function getEvento(id) {
  const res = await api.get(`/eventos/${id}/`);
  return res.data;
}

export async function crearEvento(datos) {
  const res = await api.post('/eventos/', datos);
  return res.data;
}

export async function borrarEvento(id) {
  await api.delete(`/eventos/${id}/`);
}

export async function misPerfiles() {
  const res = await api.get('/eventos/mis-perfiles/');
  return res.data;
}
