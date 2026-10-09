/**
 * Crea una conexión WebSocket al chat indicado.
 * @param {number|string} chatId - ID del chat
 * @returns {WebSocket}
 */
export function openChatSocket(chatId) {
    const token = localStorage.getItem('ensamblia_token');
    if (!token) {
        throw new Error('No hay token en localStorage');
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    // Convertimos http(s):// a ws(s)://
    const wsBase = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
    const url = `${wsBase}/ws/chat/${chatId}/?token=${token}`;

    return new WebSocket(url);
}

/**
 * Crea una conexión WebSocket al canal global de notificaciones.
 * @returns {WebSocket}
 */
export function openNotificationsSocket() {
    const token = localStorage.getItem('ensamblia_token');
    if (!token) {
        throw new Error('No hay token en localStorage');
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const wsBase = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
    const url = `${wsBase}/ws/notifications/?token=${token}`;

    return new WebSocket(url);
}