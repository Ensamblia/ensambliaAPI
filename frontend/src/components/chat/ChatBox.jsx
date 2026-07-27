import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

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

const messagesArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  backgroundColor: '#FAFAFA',
};

const msgRow = (isOwn) => ({
  display: 'flex',
  justifyContent: isOwn ? 'flex-end' : 'flex-start',
});

const bubble = (isOwn) => ({
  maxWidth: '62%',
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
});

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

const newChatBtnDisabled = {
  ...newChatBtn,
  cursor: 'not-allowed',
  color: '#D4D4D4',
};

export function ChatBox() {
  const [searchParams] = useSearchParams();
  const chatIdFromUrl = Number(searchParams.get('chat')) || null;

  const [loading, setLoading]   = useState(true);
  const [miPerfilId, setMiPerfilId] = useState(null);
  const [convs, setConvs]       = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput]       = useState('');
  const [enviando, setEnviando] = useState(false);

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

        const misChats = (await api.get('/perfil-chats/perfil', { params: { perfil_id: perfil.perfil_id } })
          .catch((err) => (err.response?.status === 404 ? { data: [] } : Promise.reject(err)))).data;

        const conversaciones = await Promise.all(misChats.map(async ({ chat_id }) => {
          const participantes = (await api.get('/perfil-chats/chat', { params: { chat_id } })).data;
          const otro = participantes.find((p) => p.perfil_id !== perfil.perfil_id);

          const [otroPerfil, mensajes] = await Promise.all([
            otro ? api.get(`/perfiles/${otro.perfil_id}`).then((r) => r.data).catch(() => null) : null,
            api.get('/mensajes/chat', { params: { chat_id } }).then((r) => r.data).catch(() => []),
          ]);

          return {
            chat_id,
            nombre: otroPerfil ? `${otroPerfil.nombre} ${otroPerfil.apellido}`.trim() : 'Conversación',
            mensajes,
            preview: mensajes.length ? mensajes[mensajes.length - 1].contenido : '',
          };
        }));

        if (cancelado) return;
        setConvs(conversaciones);
        if (chatIdFromUrl && conversaciones.some((c) => c.chat_id === chatIdFromUrl)) {
          setActiveId(chatIdFromUrl);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => { cancelado = true; };
  }, []);

  const active = convs.find((c) => c.chat_id === activeId);

  const enviar = async () => {
    if (!input.trim() || !activeId || enviando) return;
    setEnviando(true);
    try {
      const nuevo = (await api.post('/mensajes', { contenido: input, chat_id: activeId })).data;
      setConvs((prev) => prev.map((c) =>
        c.chat_id === activeId
          ? { ...c, mensajes: [...c.mensajes, nuevo], preview: nuevo.contenido }
          : c
      ));
      setInput('');
    } catch (err) {
      // el mensaje simplemente no se añade; el usuario puede reintentar
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return <div style={{ ...layout, alignItems: 'center', justifyContent: 'center' }}><span style={emptyText}>Cargando…</span></div>;
  }

  if (!miPerfilId) {
    return (
      <div style={noticeBanner}>
        Necesitas crear tu perfil antes de usar el chat. <Link to="/perfil" style={noticeLink}>Crear mi perfil</Link>
      </div>
    );
  }

  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={sidebarTop}>
          <span style={sidebarTitle}>Mensajes</span>
          <button style={newChatBtnDisabled} disabled title="Próximamente">
            +
          </button>
        </div>

        {convs.length === 0 && (
          <p style={{ ...emptyText, padding: '20px' }}>No tienes conversaciones todavía.</p>
        )}

        {convs.map((c) => (
          <div
            key={c.chat_id}
            style={getConvItem(c.chat_id === activeId)}
            onClick={() => setActiveId(c.chat_id)}
            onMouseEnter={(e) => { if (c.chat_id !== activeId) e.currentTarget.style.background = '#F9F9F9'; }}
            onMouseLeave={(e) => { if (c.chat_id !== activeId) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={getAvatar(c.chat_id === activeId)}>{c.nombre[0]}</div>
            <div style={convMeta}>
              <div style={convName}>{c.nombre}</div>
              <div style={convPreview}>{c.preview}</div>
            </div>
          </div>
        ))}
      </aside>

      {/* Chat pane */}
      {active ? (
        <div style={chatArea}>
          <div style={chatHeader}>
            <div style={getAvatar(true)}>{active.nombre[0]}</div>
            <div>
              <div style={chatHeaderName}>{active.nombre}</div>
            </div>
          </div>

          <div style={messagesArea}>
            {active.mensajes.map((m) => (
              <div key={m.mensaje_id} style={msgRow(m.perfil_id === miPerfilId)}>
                <div style={bubble(m.perfil_id === miPerfilId)}>{m.contenido}</div>
              </div>
            ))}
          </div>

          <div style={inputRow}>
            <input
              style={textInput}
              placeholder="Escribe un mensaje…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviar()}
              onFocus={(e) => { e.target.style.borderColor = '#FF5C35'; e.target.style.boxShadow = '0 0 0 3px rgba(255,92,53,0.10)'; e.target.style.background = '#FFFFFF'; }}
              onBlur={(e)  => { e.target.style.borderColor = '#EBEBEB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFAFA'; }}
            />
            <button
              style={sendBtn}
              onClick={enviar}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E04820'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FF5C35'; e.currentTarget.style.transform = 'translateY(0)'; }}
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
    </div>
  );
}
