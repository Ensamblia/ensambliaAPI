import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { openNotificationsSocket } from '../api/ws';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

export const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [unread, setUnread] = useState({});     // { [chat_id]: count }
  const [activeChatId, setActiveChatId] = useState(null);
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // ── Fetch inicial del contador ──
  useEffect(() => {
    if (!user) {
      setUnread({});
      return;
    }

    let cancelado = false;

    api
      .get('/chats/no-leidos')
      .then((res) => {
        if (cancelado) return;
        const porChat = res.data?.por_chat || {};
        // Convertimos las keys a string normalizadas
        const normalized = {};
        Object.entries(porChat).forEach(([k, v]) => {
          if (v > 0) normalized[String(k)] = v;
        });
        setUnread(normalized);
      })
      .catch((err) => {
        console.error('[Unread] Error cargando contador:', err);
      });

    return () => {
      cancelado = true;
    };
  }, [user]);

  // ── WebSocket global de notificaciones ──
  useEffect(() => {
    if (!user) return;

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
            const chatId = String(data.chat_id);
            if (chatId === String(activeChatIdRef.current)) return;
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
  }, [user]);

  const clearUnread = (chatId) => {
    const key = String(chatId);
    setUnread((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  return (
    <NotificationsContext.Provider
      value={{
        unread,
        totalUnread,
        clearUnread,
        activeChatId,
        setActiveChatId,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}