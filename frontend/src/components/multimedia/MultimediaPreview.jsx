// src/components/multimedia/MultimediaPreview.jsx
import React, { useState } from 'react';
import { Button, Lightbox } from '@/components/ui';
import styles from './MultimediaPreview.module.css';

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

function toLightboxItem(m, index) {
  const url = m.archivo_url || m.archivo;
  const mime = m.tipo_mime || '';
  return {
    id: m.multimedia_id ?? index,
    url,
    type: mime.startsWith('video/') ? 'video' : 'image',
    alt: m.nombre || `Multimedia ${index + 1}`,
  };
}

/**
 * Preview de un multimedia.
 *
 * Si se pasa `allMultimedia` e `initialIndex`, las **imágenes** son clickables
 * y abren un `Lightbox` con navegación ←/→ entre los medios del mismo grupo.
 * Si no, se muestran sin ampliación (retrocompatible).
 *
 * @param {Object} props
 * @param {Object} props.multimedia
 * @param {Array<Object>} [props.allMultimedia]   - lista completa para el lightbox
 * @param {number} [props.initialIndex=0]          - índice de este medio en allMultimedia
 */
export function MultimediaPreview({ multimedia, allMultimedia, initialIndex = 0 }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState(false);

  if (!multimedia) return null;

  const url = multimedia.archivo_url || multimedia.archivo;
  const mime = multimedia.tipo_mime || '';
  const ampliable = Array.isArray(allMultimedia) && allMultimedia.length > 0;

  // ── Imagen ──
  if (mime.startsWith('image/')) {
    const items = (ampliable ? allMultimedia : [multimedia]).map(toLightboxItem);

    const img = error ? (
      <div className={styles.placeholder}>🖼️ Imagen no disponible</div>
    ) : (
      <img
        src={url}
        alt={multimedia.nombre}
        className={styles.image}
        onError={() => setError(true)}
      />
    );

    return (
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          {ampliable ? (
            <button
              type="button"
              className={styles.mediaButton}
              onClick={() => setLightboxOpen(true)}
              aria-label={`Ampliar ${multimedia.nombre || 'imagen'}`}
            >
              {img}
            </button>
          ) : (
            img
          )}
        </div>
        <Lightbox
          open={lightboxOpen}
          items={items}
          initialIndex={initialIndex}
          onClose={() => setLightboxOpen(false)}
        />
      </div>
    );
  }

  // ── Audio ──
  if (mime.startsWith('audio/')) {
    return (
      <div className={styles.container}>
        <div className={styles.mediaHeader}>
          <span className={styles.filename}>{multimedia.nombre}</span>
          <span className={styles.sizeText}>{formatBytes(multimedia.tamano_bytes)}</span>
        </div>
        <div className={styles.mediaWrapper}>
          <audio controls src={url} className={styles.media} />
        </div>
      </div>
    );
  }

  // ── Vídeo ──
  if (mime.startsWith('video/')) {
    return (
      <div className={styles.container}>
        <div className={styles.mediaWrapper}>
          {error ? (
            <div className={styles.placeholder}>🎬 Vídeo no disponible</div>
          ) : (
            <video
              controls
              src={url}
              className={styles.media}
              onError={() => setError(true)}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Documento ──
  return (
    <div className={styles.container}>
      <div className={styles.docCard}>
        <span className={styles.docIcon}>{iconoParaMime(mime)}</span>
        <div className={styles.docInfo}>
          <span className={styles.docName}>{multimedia.nombre}</span>
          <span className={styles.docType}>
            {etiquetaParaMime(mime)} · {formatBytes(multimedia.tamano_bytes)}
          </span>
        </div>
        <Button
          href={url}
          variant="primary"
          size="sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir ↗
        </Button>
      </div>
    </div>
  );
}