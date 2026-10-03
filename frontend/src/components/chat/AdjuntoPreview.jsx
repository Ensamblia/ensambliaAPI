import React from 'react';

const container = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  maxWidth: '280px',
};

const imgStyle = {
  maxWidth: '100%',
  maxHeight: '240px',
  borderRadius: '10px',
  display: 'block',
};

const mediaStyle = {
  width: '100%',
  borderRadius: '10px',
  display: 'block',
};

const fileLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '8px',
  textDecoration: 'none',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  fontWeight: 600,
  color: 'inherit',
  wordBreak: 'break-all',
};

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdjuntoPreview({ adjunto, isOwn }) {
  if (!adjunto) return null;

  const url = adjunto.archivo_url || adjunto.archivo;
  const mime = adjunto.content_type || '';

  if (mime.startsWith('image/')) {
    return (
      <div style={container}>
        <img src={url} alt={adjunto.nombre} style={imgStyle} />
      </div>
    );
  }

  if (mime.startsWith('audio/')) {
    return (
      <div style={container}>
        <audio controls src={url} style={mediaStyle} />
      </div>
    );
  }

  if (mime.startsWith('video/')) {
    return (
      <div style={container}>
        <video controls src={url} style={mediaStyle} />
      </div>
    );
  }

  // Para otros (PDF, docs...) → link descargable
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={fileLink}>
      📎 <span>{adjunto.nombre}</span>
      <span style={{ opacity: 0.7 }}>({formatBytes(adjunto.tamano_bytes)})</span>
    </a>
  );
}