import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { extractList } from '../../api/axios';
import { openChatSocket } from '../../api/ws';
import { NotificationsContext } from '../../context/NotificationsContext';

/* ── Layout ── */
const layout = {
  display: 'flex',
  height: 'calc(100vh - 56px)',
  overflow: 'hidden',
  backgroundColor: '#FFFFFF',
};

/* ── Sidebar ── */
const sidebar = {
  width: '288px',
  borderRight: '1px solid #EBEBEB',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  flexShrink: 0,
};

const sidebarTop = {
  padding: '20px 20px 14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #EBEBEB',
};

const sidebarTitle = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700,
  fontSize: '14px',
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
};

const newChatBtn = {
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  border: '1px solid #EBEBEB',
  backgroundColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  cursor: 'pointer',
  color: '#8A8A8A',
  transition: 'background 140ms ease, color 140ms ease',
};

const newChatBtnDisabled = {
  ...newChatBtn,
  cursor: 'not-allowed',
  color: '#D4D4D4',
};

const getConvItem = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '13px 20px',
  cursor: 'pointer',
  backgroundColor: active ? '#F2F2F2' : 'transparent',
  borderBottom: '1px solid #F2F2F2',
  transition: 'background 140ms ease',
});

const getAvatar = (active) => ({
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  backgroundColor: active ? '#FF5C35' : '#0F0F0F',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700,
  fontSize: '14px',
  flexShrink: 0,
});

const convMeta = { flex: 1, minWidth: 0 };

const convName = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  fontWeight: 600,
  color: '#0F0F0F',
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const convPreview = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#8A8A8A',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '180px',
  marginTop: '2px',
};

const unreadBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '20px',
  height: '20px',
  padding: '0 6px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 700,
  lineHeight: 1,
  flexShrink: 0,
};

const editTextarea = {
  width: '100%',
  minHeight: '80px',
  padding: '10px 14px',
  border: '1px solid #FF5C35',
  borderRadius: '10px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  lineHeight: 1.55,
  color: '#0F0F0F',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  resize: 'vertical',
  boxShadow: '0 0 0 3px rgba(255,92,53,0.10)',
  letterSpacing: '-0.01em',
  boxSizing: 'border-box',
};

const editActionsRow = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
  marginTop: '6px',
};

const editBtnSecondary = {
  padding: '8px 16px',
  backgroundColor: 'transparent',
  color: '#8A8A8A',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'border-color 140ms ease, color 140ms ease',
};

const editBtnPrimary = {
  padding: '8px 20px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 140ms ease',
};

/* ── Chat area ── */
const chatArea = { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 };

const chatHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 24px',
  borderBottom: '1px solid #EBEBEB',
  backgroundColor: '#FFFFFF',
};

const chatHeaderName = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '14px',
  color: '#0F0F0F',
  letterSpacing: '-0.01em',
};

const chatHeaderSub = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  color: '#8A8A8A',
  marginTop: '1px',
};

const connectionDot = (online) => ({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: online ? '#22C55E' : '#D4D4D4',
  flexShrink: 0,
});

const connectionBadge = (online) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  color: online ? '#22C55E' : '#8A8A8A',
});

const messagesArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  backgroundColor: '#FAFAFA',
};

const loadingBanner = {
  textAlign: 'center',
  padding: '12px',
  color: '#8A8A8A',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
};

const startBanner = {
  textAlign: 'center',
  padding: '12px',
  color: '#D4D4D4',
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  fontStyle: 'italic',
};

const msgRow = (isOwn) => ({
  display: 'flex',
  justifyContent: isOwn ? 'flex-end' : 'flex-start',
  width: '100%',
});

const msgWrapper = (enEdicion) => ({
  position: 'relative',
  maxWidth: enEdicion ? '90%' : '70%',
  width: enEdicion ? '90%' : 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const bubble = (isOwn, eliminado) => ({
  padding: '10px 14px',
  borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
  backgroundColor: isOwn ? '#0F0F0F' : '#FFFFFF',
  color: isOwn ? '#FFFFFF' : '#0F0F0F',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  lineHeight: 1.55,
  border: isOwn ? 'none' : '1px solid #EBEBEB',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  letterSpacing: '-0.01em',
  fontStyle: eliminado ? 'italic' : 'normal',
  opacity: eliminado ? 0.6 : 1,
  wordBreak: 'break-word',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
});

const leidoIndicator = (leido) => ({
  fontSize: '11px',
  marginTop: '4px',
  textAlign: 'right',
  color: leido ? '#22C55E' : 'rgba(255,255,255,0.5)',
  letterSpacing: '-1px',
});

const editIndicator = {
  fontSize: '10px',
  marginTop: '4px',
  textAlign: 'right',
  color: 'rgba(255,255,255,0.4)',
  fontStyle: 'italic',
};

const msgActionsBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#8A8A8A',
  fontSize: '16px',
  padding: '0 4px',
  alignSelf: 'flex-end',
  opacity: 0.4,
  transition: 'opacity 140ms ease',
  marginTop: '2px',
};

const menu = {
  position: 'absolute',
  right: '0',
  top: '100%',
  backgroundColor: '#FFFFFF',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
  padding: '4px',
  zIndex: 100,
  minWidth: '120px',
};

const menuItem = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  background: 'none',
  border: 'none',
  borderRadius: '6px',
  textAlign: 'left',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#0F0F0F',
  cursor: 'pointer',
};

const menuItemDanger = {
  ...menuItem,
  color: '#E0402B',
};

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 15, 15, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 140ms ease',
};

const modalCard = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  padding: '28px',
  maxWidth: '400px',
  width: '90%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const modalTitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '16px',
  fontWeight: 700,
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
  margin: 0,
};

const modalText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  color: '#555555',
  lineHeight: 1.5,
  margin: 0,
};

const modalPreview = {
  backgroundColor: '#F2F2F2',
  borderRadius: '8px',
  padding: '10px 14px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#2B2B2B',
  fontStyle: 'italic',
  maxHeight: '80px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
};

const modalActions = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
  marginTop: '4px',
};

const modalBtnSecondary = {
  padding: '10px 20px',
  backgroundColor: 'transparent',
  color: '#555555',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 140ms ease, border-color 140ms ease',
};

const modalBtnDanger = {
  padding: '10px 22px',
  backgroundColor: '#E0402B',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 140ms ease',
};

const typingIndicator = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#8A8A8A',
  fontStyle: 'italic',
  padding: '4px 0',
};

const inputRow = {
  display: 'flex',
  gap: '8px',
  padding: '14px 24px',
  borderTop: '1px solid #EBEBEB',
  backgroundColor: '#FFFFFF',
};

const textInput = {
  flex: 1,
  padding: '10px 16px',
  border: '1px solid #EBEBEB',
  borderRadius: '999px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  color: '#0F0F0F',
  backgroundColor: '#FAFAFA',
  outline: 'none',
  transition: 'border-color 140ms ease, box-shadow 140ms ease',
  letterSpacing: '-0.01em',
};

const sendBtn = {
  padding: '10px 20px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  borderRadius: '999px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '13px',
  letterSpacing: '-0.01em',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 140ms ease, transform 140ms ease',
  flexShrink: 0,
};

const editBar = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  backgroundColor: '#FFF0EC',
  borderTop: '1px solid #FFD9CC',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#8A6D00',
};

const cancelBtn = {
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  color: '#FF5C35',
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
};

const emptyPane = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '10px',
  color: '#D4D4D4',
};

const emptyIcon = { fontSize: '2.4rem' };

const emptyText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#8A8A8A',
  letterSpacing: '-0.01em',
};

const noticeBanner = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#8A6D00',
  padding: '24px',
};

const noticeLink = { color: '#FF5C35', fontWeight: 600 };

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

  // Menú contextual
  const [openMenuId, setOpenMenuId] = useState(null);
  // Modal de confirmación
const [mensajeAEliminar, setMensajeAEliminar] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);

  // ── 1. Carga inicial ──
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
              preview: mensajesRes.lista.length
                ? mensajesRes.lista[mensajesRes.lista.length - 1].contenido
                : '',
              has_more: mensajesRes.hay,
            };
          })
        );

        if (cancelado) return;
        setConvs(conversaciones);

        // Guardar has_more por chat
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

  // ── 2. Resetear presencia al cambiar de chat ──
  useEffect(() => {
    setOnlinePerfiles(new Set());
    setTypingPerfil(null);
    setEditingMensajeId(null);
    setEditingContenido('');
    setOpenMenuId(null);
  }, [activeId]);

  // ── 3. Registrar el chat activo ──
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

  // ── 4. Conexión WebSocket ──
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
                      preview: data.contenido,
                    }
                  : c
              )
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
                          : m
                      ),
                    }
                  : c
              )
            );
          } else if (data.tipo === 'mensaje_editado') {
            setConvs((prev) =>
              prev.map((c) =>
                c.chat_id === activeId
                  ? {
                      ...c,
                      mensajes: c.mensajes.map((m) =>
                        m.mensaje_id === data.mensaje_id
                          ? { ...m, contenido: data.contenido, esta_editado: true }
                          : m
                      ),
                    }
                  : c
              )
            );
          } else if (data.tipo === 'mensaje_borrado') {
            setConvs((prev) =>
              prev.map((c) =>
                c.chat_id === activeId
                  ? {
                      ...c,
                      mensajes: c.mensajes.map((m) =>
                        m.mensaje_id === data.mensaje_id
                          ? { ...m, esta_eliminado: true }
                          : m
                      ),
                    }
                  : c
              )
            );
          }
        } catch (e) {
          console.error('[WS] JSON inválido:', e);
        }
      };

      socket.onclose = (e) => {
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

  // ── 5. Marcar como leídos al abrir el chat ──
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

  // ── 6. Autoscroll al cambiar de chat ──
  useEffect(() => {
    if (!activeId) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 50);
  }, [activeId]);

  const active = convs.find((c) => c.chat_id === activeId);

  // ── 7. Autoscroll al llegar mensajes/typing ──
  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceFromBottom < 150;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.mensajes?.length, typingPerfil]);

  const otroOnline = active?.otroPerfilId
    ? onlinePerfiles.has(active.otroPerfilId)
    : false;

  // ── 8. Enviar mensaje ──
  const enviar = () => {
    if (!input.trim() || !activeId || enviando) return;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ tipo: 'mensaje', contenido: input.trim() }));
    setInput('');
  };

  // ── 9. Enviar typing ──
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ tipo: 'typing' }));
    }
  };

  // ── 10. Editar mensaje ──
  const iniciarEdicion = (m) => {
    setEditingMensajeId(m.mensaje_id);
    setEditingContenido(m.contenido);
    setOpenMenuId(null);
  };

  const cancelarEdicion = () => {
    setEditingMensajeId(null);
    setEditingContenido('');
  };

  const guardarEdicion = () => {
    if (!editingContenido.trim() || !editingMensajeId) return;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
      tipo: 'editar_mensaje',
      mensaje_id: editingMensajeId,
      contenido: editingContenido.trim(),
    }));
    cancelarEdicion();
  };

  // ── 11. Abrir modal de borrado ──
  const pedirConfirmacionBorrado = (m) => {
    setOpenMenuId(null);
    setMensajeAEliminar(m);
  };

  // ── 12. Confirmar borrado (desde el modal) ──
  const confirmarBorrado = () => {
    if (!mensajeAEliminar) return;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
    setMensajeAEliminar(null);
    return;
    }

    socket.send(JSON.stringify({
      tipo: 'borrar_mensaje',
      mensaje_id: mensajeAEliminar.mensaje_id,
    }));

    setMensajeAEliminar(null);
  };

const cancelarBorrado = () => {
  setMensajeAEliminar(null);
};

  // ── 12. Cerrar menú contextual al hacer click fuera ──
  useEffect(() => {
    if (!openMenuId) return;
    const cerrar = () => setOpenMenuId(null);
    window.addEventListener('click', cerrar);
    return () => window.removeEventListener('click', cerrar);
  }, [openMenuId]);

  // ── 13. Scroll infinito: cargar mensajes antiguos ──
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
              : c
          )
        );

        setHasMore((prev) => ({ ...prev, [activeId]: hay }));

        // Restaurar posición del scroll
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

  // ── 14. Detectar scroll al principio ──
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

  if (loading) {
    return (
      <div style={{ ...layout, alignItems: 'center', justifyContent: 'center' }}>
        <span style={emptyText}>Cargando…</span>
      </div>
    );
  }

  if (!miPerfilId) {
    return (
      <div style={noticeBanner}>
        Necesitas crear tu perfil antes de usar el chat.{' '}
        <Link to="/perfil" style={noticeLink}>Crear mi perfil</Link>
      </div>
    );
  }

  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={sidebarTop}>
          <span style={sidebarTitle}>Mensajes</span>
          <button style={newChatBtnDisabled} disabled title="Próximamente">+</button>
        </div>

        {convs.length === 0 && (
          <p style={{ ...emptyText, padding: '20px' }}>No tienes conversaciones todavía.</p>
        )}

        {convs.map((c) => {
          const unreadCount = unread?.[String(c.chat_id)] || 0;
          return (
            <div
              key={c.chat_id}
              style={getConvItem(c.chat_id === activeId)}
              onClick={() => setActiveId(c.chat_id)}
              onMouseEnter={(e) => {
                if (c.chat_id !== activeId) e.currentTarget.style.background = '#F9F9F9';
              }}
              onMouseLeave={(e) => {
                if (c.chat_id !== activeId) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={getAvatar(c.chat_id === activeId)}>{c.nombre[0]}</div>
              <div style={convMeta}>
                <div style={convName}>{c.nombre}</div>
                <div style={convPreview}>{c.preview}</div>
              </div>
              {unreadCount > 0 && (
                <span style={unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </div>
          );
        })}
      </aside>

      {/* Chat pane */}
      {active ? (
        <div style={chatArea}>
          <div style={chatHeader}>
            <div style={getAvatar(true)}>{active.nombre[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={chatHeaderName}>{active.nombre}</div>
              <div style={chatHeaderSub}>
                <span style={connectionBadge(wsConnected && otroOnline)}>
                  <span style={connectionDot(wsConnected && otroOnline)} />
                  {!wsConnected ? 'Desconectado' : (otroOnline ? 'En línea' : 'Ausente')}
                </span>
              </div>
            </div>
          </div>

          <div style={messagesArea} ref={messagesAreaRef}>
            {loadingMore && (
              <div style={loadingBanner}>Cargando mensajes anteriores…</div>
            )}
            {!loadingMore && !hasMore[activeId] && active.mensajes.length >= 30 && (
              <div style={startBanner}>Inicio de la conversación</div>
            )}
            {active.mensajes.map((m) => {
              const esMio = m.perfil_id === miPerfilId;
              const leidoPorOtro = esMio
                ? (m.leido_por || []).some((p) => p !== miPerfilId)
                : false;
              const enEdicion = editingMensajeId === m.mensaje_id;

              return (
                <div key={m.mensaje_id} style={msgRow(esMio)}>
                  <div style={msgWrapper(enEdicion)}>
                    {enEdicion ? (
                      <div style={{ width: '100%' }}>
                        <textarea
                          autoFocus
                          value={editingContenido}
                          onChange={(e) => setEditingContenido(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              guardarEdicion();
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelarEdicion();
                            }
                          }}
                          style={editTextarea}
                          rows={3}
                        />
                        <div style={editActionsRow}>
                          <button
                            onClick={cancelarEdicion}
                            style={editBtnSecondary}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D0D0D0'; e.currentTarget.style.color = '#2B2B2B'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EBEBEB'; e.currentTarget.style.color = '#8A8A8A'; }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={guardarEdicion}
                            style={editBtnPrimary}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#E04820'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FF5C35'; }}
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={bubble(esMio, m.esta_eliminado)}>
                          <div>
                            {m.esta_eliminado ? '🚫 Este mensaje ha sido eliminado' : m.contenido}
                          </div>
                          {esMio && !m.esta_eliminado && (
                            <div style={leidoIndicator(leidoPorOtro)}>
                              {leidoPorOtro ? '✓✓' : '✓'}
                            </div>
                          )}
                          {m.esta_editado && !m.esta_eliminado && (
                            <div style={editIndicator}>editado</div>
                          )}
                        </div>
                        {esMio && !m.esta_eliminado && (
                          <button
                            style={msgActionsBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === m.mensaje_id ? null : m.mensaje_id);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
                          >
                            ⋯
                          </button>
                        )}
                        {openMenuId === m.mensaje_id && (
                          <div style={menu}>
                            <button
                              style={menuItem}
                              onClick={() => iniciarEdicion(m)}
                            >
                              Editar
                            </button>
                            <button
                              style={menuItemDanger}
                              onClick={() => pedirConfirmacionBorrado(m)}
                            >
                                Borrar
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {typingPerfil && (
              <div style={msgRow(false)}>
                <div style={bubble(false)}>
                  <span style={typingIndicator}>escribiendo…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {editingMensajeId && (
            <div style={editBar}>
              Editando mensaje…
              <button style={cancelBtn} onClick={cancelarEdicion}>Cancelar</button>
            </div>
          )}

          <div style={inputRow}>
            <input
              style={textInput}
              placeholder="Escribe un mensaje…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && enviar()}
              onFocus={(e) => {
                e.target.style.borderColor = '#FF5C35';
                e.target.style.boxShadow = '0 0 0 3px rgba(255,92,53,0.10)';
                e.target.style.background = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#EBEBEB';
                e.target.style.boxShadow = 'none';
                e.target.style.background = '#FAFAFA';
              }}
            />
            <button
              style={sendBtn}
              onClick={enviar}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E04820';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FF5C35';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Enviar
            </button>
          </div>
        </div>
            ) : (
        <div style={{ ...chatArea, alignItems: 'center', justifyContent: 'center' }}>
          <div style={emptyPane}>
            <span style={emptyIcon}>💬</span>
            <span style={emptyText}>Selecciona una conversación</span>
          </div>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {mensajeAEliminar && (
        <div style={modalOverlay} onClick={cancelarBorrado}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalTitle}>¿Borrar mensaje?</h3>
            <p style={modalText}>
              Esta acción no se puede deshacer. El mensaje aparecerá como eliminado en el chat.
            </p>
            <div style={modalPreview}>
              {mensajeAEliminar.contenido.length > 200
                ? mensajeAEliminar.contenido.slice(0, 200) + '…'
                : mensajeAEliminar.contenido}
            </div>
            <div style={modalActions}>
              <button
                style={modalBtnSecondary}
                onClick={cancelarBorrado}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D0D0D0';
                  e.currentTarget.style.background = '#F9F9F9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EBEBEB';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancelar
              </button>
              <button
                style={modalBtnDanger}
                onClick={confirmarBorrado}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#B3261E'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#E0402B'; }}
              >
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}