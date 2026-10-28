import api from './axios';

export async function getMatches(params) {
  const res = await api.get('/match/', { params });
  return res.data;
}
