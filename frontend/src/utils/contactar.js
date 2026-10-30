import api from '@/api/axios';

/**
 * Abre (o reutiliza) la conversación con un perfil y navega al chat.
 * Mismo comportamiento en todos los botones "Contactar" de la app.
 * - 401: lleva al login y, tras entrar, vuelve a la página actual.
 * @returns {Promise<string>} mensaje de error para mostrar ('' si fue bien o se redirigió)
 */
export async function contactarPerfil(perfilId, navigate) {
  try {
    const res = await api.post(`/chats/con/${perfilId}`);
    navigate(`/chat?chat=${res.data.chat_id}`);
    return '';
  } catch (err) {
    const status = err.response?.status;
    if (status === 401) {
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return '';
    }
    if (status === 403) return 'Necesitas crear tu perfil antes de contactar.';
    if (status === 400) return err.response.data?.error || 'No puedes contactar contigo mismo.';
    return 'No se pudo iniciar la conversación.';
  }
}
