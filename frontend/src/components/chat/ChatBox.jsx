// src/components/chat/ChatBox.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { extractList } from '@/api/axios';
import { openChatSocket } from '@/api/ws';
import { NotificationsContext } from '@/context/NotificationsContext';
import { uploadChatAttachment } from '@/api/multimedia';
import { buildPreview } from '@/utils/chatPreview';
import { Button, EmptyState, Spinner } from '@/components/ui';
import { AdjuntoPreview } from './AdjuntoPreview';
import { ChatHeader } from './ChatHeader';
import { ConversationItem } from './ConversationItem';
import { DeleteMessageModal } from './DeleteMessageModal';
import { MensajeBubble } from './MensajeBubble';
import { MessageInput } from './MessageInput';
import styles from './ChatBox.module.css';

export function ChatBox() {
  const [searchParams] = useSearchParams();
  const chatIdFromUrl = Number(searchParams.get('chat')) || null;

  const { unread, setActiveChatId, clearUnread } = useContext(NotificationsContext);

  const [loading, setLoading] = useState(true);
  const [miPerfilId, setMiPerfilId] = useState(null);
  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [typingPerfil, setTypingPerfil] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [onlinePerfiles, setOnlinePerfiles] = useState(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState({});

  // Edición
  const [editingMensajeId, setEditingMensajeId] = useState(null);
  const [editingContenido, setEditingContenido] = useState('');

  // Modal borrar
  const [mensajeAEliminar, setMensajeAEliminar] = useState(null);

  // Adjuntos
  const [adjuntosPendientes, setAdjuntosPendientes] = useState([]);
  const [subiendoAdjunto, setSubiendoAdjunto] = useState(false);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);

  // 1. Carga inicial
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        let perfil;
        try {
          perfil = (await api.get('/perfiles/me')).data;
        } catch (err) {
          if (err.response?.status === 404) {
            if (!cancelado) setLoading(false);
            return;
          }
          throw err;
        }
        if (cancelado) return;
        setMiPerfilId(perfil.perfil_id);

        const misChatsRes = await api
          .get('/perfil-chats/perfil', { params: { perfil_id: perfil.perfil_id } })
          .catch((err) => (err.response?.status === 404 ? { data: [] } : Promise.reject(err)));
        const misChats = extractList(misChatsRes);

        const conversaciones = await Promise.all(
          misChats.map(async ({ chat_id }) => {
            const participantesRes = await api.get('/perfil-chats/chat', { params: { chat_id } });
            const participantes = extractList(participantesRes);
            const otro = participantes.find((p) => p.perfil_id !== perfil.perfil_id);

            const [otroPerfil, mensajesRes] = await Promise.all([
              otro
                ? api.get(`/perfiles/${otro.perfil_id}`).then((r) => r.data).catch(() => null)
                : null,
              api
                .get('/mensajes/chat', { params: { chat_id, limit: 30 } })
                .then((r) => {
                  const data = r.data;
                  const lista = data?.results ?? (Array.isArray(data) ? data : []);
                  const hay = data?.has_more ?? false;
                  return { lista, hay };
                })
                .catch(() => ({ lista: [], hay: false })),
            ]);

            return {
              chat_id,
              otroPerfilId: otro?.perfil_id ?? null,
              nombre: otroPerfil
                ? `${otroPerfil.nombre} ${otroPerfil.apellido}`.trim()
                : 'Conversación',
              mensajes: mensajesRes.lista.map((m) => ({
                ...m,
                leido_por: m.leido_por || [],
              })),
              preview: buildPreview(
                mensajesRes.lista[mensajesRes.lista.length - 1],
              ),
              has_more: mensajesRes.hay,
            };
          }),
        );

        if (cancelado) return;
        setConvs(conversaciones);

        const hasMoreMap = {};
        conversaciones.forEach((c) => {
          hasMoreMap[c.chat_id] = c.has_more || false;
        });
        setHasMore(hasMoreMap);

        if (chatIdFromUrl && conversaciones.some((c) => c.chat_id === chatIdFromUrl)) {
          setActiveId(chatIdFromUrl);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Resetear presencia y adjuntos al cambiar de chat
  useEffect(() => {
    setOnlinePerfiles(new Set());
    setTypingPerfil(null);
    setEditingMensajeId(null);
    setEditingContenido('');
    setAdjuntosPendientes([]);
  }, [activeId]);

  // 3. Registrar el chat activo
  useEffect(() => {
    setActiveChatId(activeId);
    if (activeId) {
      clearUnread(activeId);
    }
    return () => {
      setActiveChatId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // 4. Conexión WebSocket
  useEffect(() => {
    if (!activeId || !miPerfilId) return;

    let cerrado = false;

    function conectar() {
      if (cerrado) return;
      let socket;
      try {
        socket = openChatSocket(activeId);
      } catch (e) {
        console.error('Error abriendo WS:', e);
        return;
      }
      socketRef.current = socket;

      socket.onopen = () => {
        if (cerrado) return;
        setWsConnected(true);
      };

      socket.onmessage = (event) => {
        if (cerrado) return;
        try {
          const data = JSON.parse(event.data);

          if (data.tipo === 'mensaje') {
            setConvs((prev) =>
              prev.map((c) =>
                c.chat_id === activeId
                  ? {
                      ...c,
                      mensajes: [...c.mensajes, { ...data, leido_por: data.leido_por || [] }],
                      preview: buildPreview(data),
                    }
                  : c,
              ),
            );
            setTypingPerfil(null);

            if (data.perfil_id !== miPerfilId && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ tipo: 'leido', mensaje_id: data.mensaje_id }));
            }
          } else if (data.tipo === 'typing') {
            if (data.perfil_id !== miPerfilId) {
              setTypingPerfil(data.perfil_id);
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setTypingPerfil(null), 3000);
            }
          } else if (data.tipo === 'presence_snapshot') {
            setOnlinePerfiles(new Set(data.perfiles_online || []));
          } else if (data.tipo === 'status') {
            setOnlinePerfiles((prev) => {
              const next = new Set(prev);
              if (data.status === 'online') {
                next.add(data.perfil_id);
              } else {
                next.delete(data.perfil_id);
              }
              return next;
            });
          } else if (data.tipo === 'leido') {
            setConvs((prev) =>
              prev.map((c) =>
                c.chat_id === activeId
                  ? {
                      ...c,
                      mensajes: c.mensajes.map((m) =>
                        m.mensaje_id === data.mensaje_id
                          ? {
                              ...m,
                              leido_por: [
                                ...(m.leido_por || []).filter((p) => p !== data.perfil_id),
                                data.perfil_id,
                              ],
                            }
                          : m,
                      ),
                    }
                  : c,
              ),
            );
          } else if (data.tipo === 'mensaje_editado') {
            setConvs((prev) =>
              prev.map((c) => {
                if (c.chat_id !== activeId) return c;
                const nuevosMensajes = c.mensajes.map((m) =>
                  m.mensaje_id === data.mensaje_id
                    ? { ...m, contenido: data.contenido, esta_editado: true }
                    : m,
                );
                return {
                  ...c,
                  mensajes: nuevosMensajes,
                  preview: buildPreview(nuevosMensajes[nuevosMensajes.length - 1]),
                };
              }),
            );
          } else if (data.tipo === 'mensaje_borrado') {
            setConvs((prev) =>
              prev.map((c) => {
                if (c.chat_id !== activeId) return c;
                const nuevosMensajes = c.mensajes.map((m) =>
                  m.mensaje_id === data.mensaje_id
                    ? { ...m, esta_eliminado: true }
                    : m,
                );
                return {
                  ...c,
                  mensajes: nuevosMensajes,
                  preview: buildPreview(nuevosMensajes[nuevosMensajes.length - 1]),
                };
              }),
            );
          }
        } catch (e) {
          console.error('[WS] JSON inválido:', e);
        }
      };

      socket.onclose = () => {
        if (cerrado) return;
        setWsConnected(false);
        reconnectTimeoutRef.current = setTimeout(conectar, 2000);
      };

      socket.onerror = () => {};
    }

    conectar();

    return () => {
      cerrado = true;
      clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setWsConnected(false);
      setTypingPerfil(null);
    };
  }, [activeId, miPerfilId]);

  // 5. Marcar leídos al abrir
  useEffect(() => {
    if (!activeId || !miPerfilId || !wsConnected) return;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const activeConv = convs.find((c) => c.chat_id === activeId);
    if (!activeConv) return;

    activeConv.mensajes
      .filter((m) => m.perfil_id !== miPerfilId && !m.esta_eliminado)
      .filter((m) => !(m.leido_por || []).includes(miPerfilId))
      .forEach((m) => {
        socket.send(JSON.stringify({ tipo: 'leido', mensaje_id: m.mensaje_id }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, wsConnected, miPerfilId, convs]);

  // 6. Autoscroll al cambiar de chat
  useEffect(() => {
    if (!activeId) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 50);
  }, [activeId]);

  const active = convs.find((c) => c.chat_id === activeId);

  // 7. Autoscroll al llegar mensajes/typing
  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 150) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.mensajes?.length, typingPerfil]);

  const otroOnline = active?.otroPerfilId
    ? onlinePerfiles.has(active.otroPerfilId)
    : false;

  // 8. Enviar mensaje
  const enviar = () => {
    const tieneContenido = input.trim().length > 0;
    const tieneAdjuntos = adjuntosPendientes.length > 0;
    if ((!tieneContenido && !tieneAdjuntos) || !activeId || enviando) return;

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        tipo: 'mensaje',
        contenido: input.trim(),
        adjunto_ids: adjuntosPendientes.map((a) => a.adjunto_id),
      }),
    );

    setInput('');
    setAdjuntosPendientes([]);
  };

  // 9. Enviar typing
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ tipo: 'typing' }));
    }
  };

  // 10. Editar mensaje
  const iniciarEdicion = (m) => {
    setEditingMensajeId(m.mensaje_id);
    setEditingContenido(m.contenido);
  };

  const cancelarEdicion = () => {
    setEditingMensajeId(null);
    setEditingContenido('');
  };

  const guardarEdicion = () => {
    if (!editingContenido.trim() || !editingMensajeId) return;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        tipo: 'editar_mensaje',
        mensaje_id: editingMensajeId,
        contenido: editingContenido.trim(),
      }),
    );
    cancelarEdicion();
  };

  // 11. Abrir modal de borrado
  const pedirConfirmacionBorrado = (m) => {
    setMensajeAEliminar(m);
  };

  // 12. Confirmar borrado
  const confirmarBorrado = () => {
    if (!mensajeAEliminar) return;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setMensajeAEliminar(null);
      return;
    }
    socket.send(
      JSON.stringify({
        tipo: 'borrar_mensaje',
        mensaje_id: mensajeAEliminar.mensaje_id,
      }),
    );
    setMensajeAEliminar(null);
  };

  const cancelarBorrado = () => {
    setMensajeAEliminar(null);
  };

  // 13. Adjuntos del chat
  const handleAdjuntoChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (adjuntosPendientes.length + files.length > 5) {
      alert('Máximo 5 adjuntos por mensaje');
      if (e.target) e.target.value = '';
      return;
    }

    setSubiendoAdjunto(true);
    try {
      const subidos = [];
      for (const file of files) {
        const adj = await uploadChatAttachment(file);
        subidos.push(adj);
      }
      setAdjuntosPendientes((prev) => [...prev, ...subidos]);
    } catch (err) {
      console.error(err);
      alert('No se pudo subir el archivo');
    } finally {
      setSubiendoAdjunto(false);
      if (e.target) e.target.value = '';
    }
  };

  const quitarAdjunto = (id) => {
    setAdjuntosPendientes((prev) => prev.filter((a) => a.adjunto_id !== id));
  };

  // 14. Scroll infinito
  const cargarMasAntiguos = async () => {
    if (loadingMore || !activeId) return;
    if (!hasMore[activeId]) return;

    const conv = convs.find((c) => c.chat_id === activeId);
    if (!conv || conv.mensajes.length === 0) return;

    setLoadingMore(true);

    const el = messagesAreaRef.current;
    const oldScrollHeight = el ? el.scrollHeight : 0;
    const oldScrollTop = el ? el.scrollTop : 0;

    try {
      const firstMensajeId = conv.mensajes[0].mensaje_id;
      const params = { chat_id: activeId, limit: 30, before_id: firstMensajeId };
      const res = await api.get('/mensajes/chat', { params });
      const data = res.data;
      const nuevos = data?.results ?? (Array.isArray(data) ? data : []);
      const hay = data?.has_more ?? false;

      if (nuevos.length > 0) {
        setConvs((prev) =>
          prev.map((c) =>
            c.chat_id === activeId
              ? {
                  ...c,
                  mensajes: [
                    ...nuevos.map((m) => ({ ...m, leido_por: m.leido_por || [] })),
                    ...c.mensajes,
                  ],
                }
              : c,
          ),
        );
        setHasMore((prev) => ({ ...prev, [activeId]: hay }));
        requestAnimationFrame(() => {
          if (!el) return;
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
        });
      } else {
        setHasMore((prev) => ({ ...prev, [activeId]: false }));
      }
    } catch (err) {
      console.error('[Chat] Error cargando mensajes antiguos:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 15. Detectar scroll al principio
  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop < 100 && !loadingMore) {
        cargarMasAntiguos();
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, activeId, convs]);

  // ── Render ──
  if (loading) {
  return (
    <div className={`${styles.layout} ${styles.layoutLoading}`}>
      <Spinner size="lg" aria-label="Cargando chat" />
    </div>
  );
}

  if (!miPerfilId) {
    return (
      <div className={styles.notice}>
        Necesitas crear tu perfil antes de usar el chat.{' '}
        <Link to="/perfil" className={styles.noticeLink}>
          Crear mi perfil
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <h2 className={styles.sidebarTitle}>Mensajes</h2>
        </div>
        {convs.length === 0 && (
          <p className={styles.emptySidebar}>No tienes conversaciones todavía.</p>
        )}
        {convs.map((c) => (
          <ConversationItem
            key={c.chat_id}
            nombre={c.nombre}
            preview={c.preview}
            unread={unread?.[String(c.chat_id)] || 0}
            active={c.chat_id === activeId}
            onClick={() => setActiveId(c.chat_id)}
          />
        ))}
      </aside>

      {/* Chat activo */}
      {active ? (
        <div className={styles.chatArea}>
          <ChatHeader
            nombre={active.nombre}
            wsConnected={wsConnected}
            otroOnline={otroOnline}
          />

          <div className={styles.messagesArea} ref={messagesAreaRef}>
            {loadingMore && (
              <div className={styles.loadingBanner}>Cargando mensajes anteriores…</div>
            )}
            {!loadingMore && !hasMore[activeId] && active.mensajes.length >= 30 && (
              <div className={styles.startBanner}>Inicio de la conversación</div>
            )}
            {active.mensajes.map((m) => {
              const esMio = m.perfil_id === miPerfilId;
              const leidoPorOtro = esMio
                ? (m.leido_por || []).some((p) => p !== miPerfilId)
                : false;
              const enEdicion = editingMensajeId === m.mensaje_id;

              return (
                <MensajeBubble
                  key={m.mensaje_id}
                  mensaje={m}
                  esMio={esMio}
                  miPerfilId={miPerfilId}
                  leidoPorOtro={leidoPorOtro}
                  enEdicion={enEdicion}
                  editContenido={enEdicion ? editingContenido : ''}
                  onEditChange={(e) => setEditingContenido(e.target.value)}
                  onStartEdit={() => iniciarEdicion(m)}
                  onCancelEdit={cancelarEdicion}
                  onSaveEdit={guardarEdicion}
                  onDeleteRequest={() => pedirConfirmacionBorrado(m)}
                />
              );
            })}
            {typingPerfil && (
              <div className={styles.typingIndicator}>escribiendo…</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {editingMensajeId && (
            <div className={styles.editBar}>
              Editando mensaje…
              <button type="button" className={styles.cancelBtn} onClick={cancelarEdicion}>
                Cancelar
              </button>
            </div>
          )}

          <MessageInput
            value={input}
            onChange={handleInputChange}
            onSend={enviar}
            adjuntosPendientes={adjuntosPendientes}
            onQuitarAdjunto={quitarAdjunto}
            subiendoAdjunto={subiendoAdjunto}
            onAdjuntoChange={handleAdjuntoChange}
          />
        </div>
      ) : (
        <div className={styles.emptyPane}>
          <span className={styles.emptyIcon}>💬</span>
          <span className={styles.emptyText}>Selecciona una conversación</span>
        </div>
      )}

      <DeleteMessageModal
        open={!!mensajeAEliminar}
        mensaje={mensajeAEliminar}
        onClose={cancelarBorrado}
        onConfirm={confirmarBorrado}
      />
    </div>
  );
}