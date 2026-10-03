import React from 'react';

/* ── Styles ── */
const container = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  borderRadius: '10px',
  overflow: 'hidden',
  backgroundColor: '#FFFFFF',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px 0',
};

const filename = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#0F0F0F',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '220px',
};

const sizeText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  color: '#8A8A8A',
  flexShrink: 0,
};

const mediaWrapper = {
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#FAFAFA',
};

const imgStyle = {
  width: '100%',
  maxHeight: '420px',
  objectFit: 'contain',
  display: 'block',
  backgroundColor: '#F2F2F2',
};

const mediaStyle = {
  width: '100%',
  display: 'block',
};

/* ── Tarjeta para documentos (PDF, txt, docx, odt) ── */
const docCard = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '18px',
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
};

const docIcon = {
  fontSize: '2rem',
  lineHeight: 1,
  flexShrink: 0,
};

const docInfo = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const docName = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  fontWeight: 600,
  color: '#0F0F0F',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const docType = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11.5px',
  color: '#8A8A8A',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontWeight: 600,
};

const docBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  borderRadius: '7px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  fontWeight: 600,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 140ms ease',
};

/* ── Helpers ── */
function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconoParaMime(mime) {
  if (mime === 'application/pdf') return '📕';
  if (mime === 'text/plain') return '📄';
  if (mime.startsWith('application/msword')) return '📘';
  if (mime.includes('wordprocessingml')) return '📘';
  if (mime.includes('opendocument')) return '📗';
  return '📎';
}

function etiquetaParaMime(mime) {
  if (mime === 'application/pdf') return 'PDF';
  if (mime === 'text/plain') return 'Texto';
  if (mime.startsWith('application/msword')) return 'Word';
  if (mime.includes('wordprocessingml')) return 'Word';
  if (mime.includes('opendocument')) return 'ODT';
  return 'Documento';
}

/* ── Componente ── */
export function MultimediaPreview({ multimedia }) {
  if (!multimedia) return null;

  const url = multimedia.archivo_url || multimedia.archivo;
  const mime = multimedia.tipo_mime || '';

  // Imagen
  if (mime.startsWith('image/')) {
    return (
      <div style={container}>
        <div style={mediaWrapper}>
          <img src={url} alt={multimedia.nombre} style={imgStyle} />
        </div>
      </div>
    );
  }

  // Audio
  if (mime.startsWith('audio/')) {
    return (
      <div style={container}>
        <div style={header}>
          <span style={filename}>{multimedia.nombre}</span>
          <span style={sizeText}>{formatBytes(multimedia.tamano_bytes)}</span>
        </div>
        <div style={mediaWrapper}>
          <audio controls src={url} style={mediaStyle} />
        </div>
      </div>
    );
  }

  // Vídeo
  if (mime.startsWith('video/')) {
    return (
      <div style={container}>
        <div style={mediaWrapper}>
          <video controls src={url} style={mediaStyle} />
        </div>
      </div>
    );
  }

  // Documentos (PDF, txt, docx, odt)
  return (
    <div style={container}>
      <div style={docCard}>
        <span style={docIcon}>{iconoParaMime(mime)}</span>
        <div style={docInfo}>
          <span style={docName}>{multimedia.nombre}</span>
          <span style={docType}>
            {etiquetaParaMime(mime)} · {formatBytes(multimedia.tamano_bytes)}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={docBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#E04820'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FF5C35'; }}
        >
          Abrir ↗
        </a>
      </div>
    </div>
  );
}