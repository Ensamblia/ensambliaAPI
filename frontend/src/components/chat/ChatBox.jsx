import React, { useState } from 'react';

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

/* ── Data ── */
const SAMPLE = [
  { id: 1, nombre: 'Carlos M.',  preview: 'Te llevo mañana la guitarra', mensajes: [
    { texto: '¡Hola! ¿sigues buscando bajista?', isOwn: false },
    { texto: 'Sí, claro. ¿cuándo podemos quedar?', isOwn: true },
    { texto: 'Te llevo mañana la guitarra para que escuches', isOwn: false },
  ]},
  { id: 2, nombre: 'Laura P.',   preview: 'Perfecto, hasta el viernes', mensajes: [
    { texto: 'Vi tu anuncio de guitarrista', isOwn: false },
    { texto: 'Genial, ¿qué género tocas?', isOwn: true },
    { texto: 'Perfecto, hasta el viernes', isOwn: true },
  ]},
  { id: 3, nombre: 'DJ Marcos',  preview: 'Mando el contrato esta tarde', mensajes: [
    { texto: 'Hola, busco músico para sesión de estudio', isOwn: false },
    { texto: 'Mando el contrato esta tarde', isOwn: false },
  ]},
];

export function ChatBox() {
  const [activeId, setActiveId] = useState(null);
  const [input,    setInput]    = useState('');
  const [convs,    setConvs]    = useState(SAMPLE);

  const active = convs.find((c) => c.id === activeId);

  const enviar = () => {
    if (!input.trim() || !activeId) return;
    setConvs((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, mensajes: [...c.mensajes, { texto: input, isOwn: true }], preview: input }
          : c
      )
    );
    setInput('');
  };

  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={sidebarTop}>
          <span style={sidebarTitle}>Mensajes</span>
          <button
            style={newChatBtn}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F2F2F2'; e.currentTarget.style.color = '#0F0F0F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A8A8A'; }}
            title="Nueva conversación"
          >
            +
          </button>
        </div>

        {convs.map((c) => (
          <div
            key={c.id}
            style={getConvItem(c.id === activeId)}
            onClick={() => setActiveId(c.id)}
            onMouseEnter={(e) => { if (c.id !== activeId) e.currentTarget.style.background = '#F9F9F9'; }}
            onMouseLeave={(e) => { if (c.id !== activeId) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={getAvatar(c.id === activeId)}>{c.nombre[0]}</div>
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
              <div style={chatHeaderSub}>músico · Barcelona</div>
            </div>
          </div>

          <div style={messagesArea}>
            {active.mensajes.map((m, i) => (
              <div key={i} style={msgRow(m.isOwn)}>
                <div style={bubble(m.isOwn)}>{m.texto}</div>
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
