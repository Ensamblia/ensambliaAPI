import React from 'react';

/* Pill tag on card */
const typeTag = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 9px',
  backgroundColor: '#F2F2F2',
  color: '#8A8A8A',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  alignSelf: 'flex-start',
};

const accentTag = {
  ...typeTag,
  backgroundColor: '#FFF0EC',
  color: '#FF5C35',
};

const card = {
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  padding: '22px',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  transition: 'box-shadow 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1), border-color 220ms ease',
  cursor: 'pointer',
};

const title = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  fontWeight: 700,
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
  lineHeight: 1.3,
  margin: 0,
};

const body = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  color: '#8A8A8A',
  lineHeight: 1.6,
  margin: 0,
};

const footer = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '12px',
  borderTop: '1px solid #F2F2F2',
  marginTop: '2px',
};

const dateText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#D4D4D4',
  letterSpacing: '0.01em',
};

const arrowBtn = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: '#FF5C35',
  letterSpacing: '-0.01em',
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
};

const TIPO_LABELS = {
  1: 'Busco músico',
  2: 'Ofrezco servicio',
  3: 'Vendo instrumento',
  4: 'Busco banda',
};

export function AnuncioCard({ anuncio }) {
  const fecha = anuncio?.created_at
    ? new Date(anuncio.created_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  const tipoLabel = TIPO_LABELS[anuncio?.tipo_anuncio_id] || null;
  const contenido = anuncio?.contenido || '';

  return (
    <div
      style={card}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = '#D0D0D0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#EBEBEB';
      }}
    >
      {tipoLabel && <span style={accentTag}>{tipoLabel}</span>}

      <h3 style={title}>{anuncio?.titulo || 'Sin título'}</h3>

      <p style={body}>
        {contenido.length > 130 ? contenido.slice(0, 130) + '…' : contenido || 'Sin descripción.'}
      </p>

      <div style={footer}>
        <span style={dateText}>{fecha || '—'}</span>
        <span style={arrowBtn}>Ver más <span style={{ fontSize: '14px' }}>→</span></span>
      </div>
    </div>
  );
}
