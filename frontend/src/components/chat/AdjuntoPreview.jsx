// src/components/chat/AdjuntoPreview.jsx
import React, { useState } from 'react';
import { Lightbox } from '@/components/ui';
import styles from './AdjuntoPreview.module.css';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toLightboxItem(adjunto, index) {
  const url = adjunto.archivo_url || adjunto.archivo;
  const mime = adjunto.content_type || '';
  return {
    id: adjunto.adjunto_id ?? index,
    url,
    type: mime.startsWith('video/') ? 'video' : 'image',
    alt: adjunto.nombre || `Adjunto ${index + 1}`,
  };
}

export function AdjuntoPreview({
  adjunto,
  isOwn: _isOwn,
  allAdjuntos,
  initialIndex = 0,
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState(false);

  if (!adjunto) return null;

  const url = adjunto.archivo_url || adjunto.archivo;
  const mime = adjunto.content_type || '';

  // ── Imagen: clickable → lightbox ──
  if (mime.startsWith('image/')) {
    const items = (allAdjuntos && allAdjuntos.length > 0
      ? allAdjuntos
      : [adjunto]
    ).map(toLightboxItem);

    return (
      <div className={styles.container}>
        {error ? (
          <div className={styles.placeholder}>🖼️ Imagen no disponible</div>
        ) : (
          <button
            type="button"
            className={styles.mediaButton}
            onClick={() => setLightboxOpen(true)}
            aria-label={`Ampliar ${adjunto.nombre || 'imagen'}`}
          >
            <img
              src={url}
              alt={adjunto.nombre || ''}
              className={styles.imgStyle}
              onError={() => setError(true)}
            />
          </button>
        )}
        <Lightbox
          open={lightboxOpen}
          items={items}
          initialIndex={initialIndex}
          onClose={() => setLightboxOpen(false)}
        />
      </div>
    );
  }

  // ── Vídeo: controles nativos, sin lightbox ──
  if (mime.startsWith('video/')) {
    return (
      <div className={styles.container}>
        {error ? (
          <div className={styles.placeholder}>🎬 Vídeo no disponible</div>
        ) : (
          <video
            src={url}
            className={styles.mediaStyle}
            controls
            playsInline
            preload="metadata"
            onError={() => setError(true)}
          />
        )}
      </div>
    );
  }

  // ── Audio ──
  if (mime.startsWith('audio/')) {
    return (
      <div className={styles.container}>
        <audio controls src={url} className={styles.mediaStyle} />
      </div>
    );
  }

  // ── Documento ──
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.fileLink}
    >
      📎 <span className={styles.fileName}>{adjunto.nombre}</span>
      <span className={styles.fileSize}>
        ({formatBytes(adjunto.tamano_bytes)})
      </span>
    </a>
  );
}