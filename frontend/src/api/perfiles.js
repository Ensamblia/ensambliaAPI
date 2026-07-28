import api from './axios';

export async function getPerfilPublico(perfilId) {
  try {
    const res = await api.get(`/perfiles/${perfilId}`);
    return res.data;
  } catch {
    return null;
  }
}
