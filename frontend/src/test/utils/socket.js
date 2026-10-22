// src/test/utils/socket.js
import { WebSocket as MockWebSocket, Server as MockServer } from 'mock-socket';
import { vi } from 'vitest';

/**
 * Instala un WebSocket global mockeado (mock-socket) y devuelve utilidades
 * para inspeccionar/emitir mensajes en tests del chat y de notificaciones.
 *
 * En jsdom, `WebSocket` es una propiedad read-only del global; por eso se
 * redefine con `Object.defineProperty` en lugar de asignar directamente.
 *
 * Uso típico:
 *   const mock = installMockWebSocket('ws://localhost:8000');
 *   const server = mock.server;                 // /ws/notifications/
 *   const chat = mock.chatServer(42);           // /ws/chat/42/
 *   ...
 *   mock.restore();
 *
 * @param {string} baseUrl - p. ej. 'ws://localhost:8000'
 */
export function installMockWebSocket(baseUrl) {
    // Guardamos el descriptor original (no solo el valor) para restaurar
    // exactamente igual, incluidos getters/setters y flags.
    const originalDescriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        'WebSocket',
    );

    Object.defineProperty(globalThis, 'WebSocket', {
        value: MockWebSocket,
        configurable: true,
        writable: true,
        enumerable: originalDescriptor?.enumerable ?? true,
    });

    const notificationsServer = new MockServer(
        `${baseUrl}/ws/notifications/`,
    );
    const chatServers = new Map();

    return {
        /** Servidor mock de /ws/notifications/ */
        server: notificationsServer,

        /** Devuelve (y crea si no existe) el servidor mock de /ws/chat/:id/ */
        chatServer(chatId) {
            const id = String(chatId);
            if (!chatServers.has(id)) {
                chatServers.set(id, new MockServer(`${baseUrl}/ws/chat/${id}/`));
            }
            return chatServers.get(id);
        },

        /** Restaura el WebSocket global y para todos los servidores mock. */
        restore() {
            notificationsServer.stop();
            chatServers.forEach((s) => s.stop());
            chatServers.clear();

            // Restaurar descriptor original o eliminar la propiedad si no existía.
            if (originalDescriptor) {
                Object.defineProperty(globalThis, 'WebSocket', originalDescriptor);
            } else {
                delete globalThis.WebSocket;
            }

            vi.restoreAllMocks();
        },
    };
}

/**
 * Extrae el `token` del query string de una URL de WebSocket.
 * Útil para asserts como: `expect(getTokenFromUrl(ws.url)).toBe('mi-token')`.
 *
 * @param {string} url
 * @returns {string|null}
 */
export function getTokenFromUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.searchParams.get('token');
    } catch {
        return null;
    }
}