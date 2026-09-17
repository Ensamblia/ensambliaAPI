import api from './axios';

const perfilCache = new Map();

export async function getPerfilPublico(perfilId) {
  if (!perfilId) return null;

  const key = String(perfilId);

  if (perfilCache.has(key)) {
    return perfilCache.get(key);
  }

  const promise = api
    .get(`/perfiles/${perfilId}`)
    .then((res) => res.data)
    .catch(() => null);

  perfilCache.set(key, promise);

  return promise;
}
