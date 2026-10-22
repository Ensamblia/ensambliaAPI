// src/utils/chatPreview.js
/**
 * Devuelve el texto de preview de una conversación a partir del último mensaje.
 * - Si tiene contenido, el contenido.
 * - Si solo tiene adjuntos, "📎 Adjunto".
 * - Si está eliminado, "🚫 Mensaje eliminado" (mejor que vacío).
 * - Si no hay mensaje, "".
 *
 * @param {Object|null|undefined} mensaje
 * @returns {string}
 */
export function buildPreview(mensaje) {
    if (!mensaje) return '';
    if (mensaje.esta_eliminado) return '🚫 Mensaje eliminado';
    if (mensaje.contenido && mensaje.contenido.trim()) return mensaje.contenido;
    if (Array.isArray(mensaje.adjuntos) && mensaje.adjuntos.length > 0) {
        return '📎 Adjunto';
    }
    return '';
}