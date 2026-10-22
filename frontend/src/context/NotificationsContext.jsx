// src/context/NotificationsContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { openNotificationsSocket } from '@/api/ws';
import api from '@/api/axios';
import { AuthContext } from './AuthContext';

export const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [unread, setUnread] = useState({});
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
    // ID del timeout que difiere la CREACIÓN del socket (no el cierre).
    // En StrictMode, el cleanup del primer montaje cancela este timeout
    // ANTES de que el socket se cree → no hay "closed before established".
    let createTimeoutId = null;

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

      socket.onclose = () => {
        if (cerrado) return;
        reconnectRef.current = setTimeout(conectar, 2000);
      };

      socket.onerror = () => {
        // Silenciamos: se reconecta solo.
      };
    }

    // Diferimos la creación del socket. Si el componente se desmonta
    // antes de que el timeout dispare (StrictMode), lo cancelamos y
    // el socket NUNCA se crea → sin warning.
    createTimeoutId = setTimeout(conectar, 0);

    return () => {
      cerrado = true;
      clearTimeout(createTimeoutId);   // ← cancela la creación si aún no ocurrió
      clearTimeout(reconnectRef.current);
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        // Si el socket ya existe (segundo montaje de StrictMode, o desmontaje real),
        // lo cerramos. Ya no está en CONNECTING porque el timeout ya disparó.
        try { socket.close(); } catch { /* noop */ }
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