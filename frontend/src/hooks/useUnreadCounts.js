import { useEffect, useRef, useState } from 'react';
import { openNotificationsSocket } from '../api/ws';

/**
 * Hook que mantiene un mapa de { chat_id: num_mensajes_no_leidos }
 * usando un WebSocket global de notificaciones.
 *
 * @param {number|null} activeChatId - El chat actualmente abierto (si lo hay).
 *                                     Cuando llega un mensaje de este chat, NO se cuenta como no leído.
 * @param {boolean} enabled - Si el usuario está logueado.
 */
export function useUnreadCounts(activeChatId, enabled) {
    const [unread, setUnread] = useState({});
    const socketRef = useRef(null);
    const reconnectRef = useRef(null);
    const activeChatIdRef = useRef(activeChatId);

    // Mantener ref actualizada para el handler
    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);

    useEffect(() => {
        if (!enabled) {
            setUnread({});
            return;
        }

        let cerrado = false;

        function conectar() {
            if (cerrado) return;
            let socket;
            try {
                socket = openNotificationsSocket();
            } catch (e) {
                console.error('[WS Notif] Error abriendo:', e);
                return;
            }
            socketRef.current = socket;

            socket.onopen = () => {
                if (cerrado) return;
                console.log('[WS Notif] Conectado');
            };

            socket.onmessage = (event) => {
                if (cerrado) return;
                try {
                    const data = JSON.parse(event.data);
                    if (data.tipo === 'nuevo_mensaje') {
                        const chatId = data.chat_id;
                        // Si el mensaje es del chat activo, no cuenta
                        if (chatId === activeChatIdRef.current) return;
                        setUnread((prev) => ({
                            ...prev,
                            [chatId]: (prev[chatId] || 0) + 1,
                        }));
                    }
                } catch (e) {
                    console.error('[WS Notif] JSON inválido:', e);
                }
            };

            socket.onclose = (e) => {
                if (cerrado) return;
                console.log(`[WS Notif] Cerrado (${e.code}). Reconectando en 2s...`);
                reconnectRef.current = setTimeout(conectar, 2000);
            };

            socket.onerror = (e) => {
                console.error('[WS Notif] Error', e);
            };
        }

        conectar();

        return () => {
            cerrado = true;
            clearTimeout(reconnectRef.current);
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [enabled]);

    // Función para limpiar un chat cuando se abre
    const clearUnread = (chatId) => {
        setUnread((prev) => {
            if (!prev[chatId]) return prev;
            const next = { ...prev };
            delete next[chatId];
            return next;
        });
    };

    const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

    return { unread, totalUnread, clearUnread };
}