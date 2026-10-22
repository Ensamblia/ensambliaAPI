// src/components/ui/Lightbox/Lightbox.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBodyLock } from '@/hooks/useBodyLock';
import styles from './Lightbox.module.css';

/**
 * Visor full-screen de imágenes y vídeos.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Array<{id: string|number, url: string, type: 'image'|'video', alt?: string}>} props.items
 * @param {number} [props.initialIndex=0]
 * @param {Function} props.onClose
 * @param {Function} [props.onIndexChange]
 */
export function Lightbox({
  open,
  items = [],
  initialIndex = 0,
  onClose,
  onIndexChange,
}) {
  const [index, setIndex] = useState(initialIndex);
  const containerRef = useRef(null);

  useBodyLock(open);

  // Al abrir, sincroniza el índice inicial
  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  // Notifica cambios de índice
  useEffect(() => {
    if (open && onIndexChange) onIndexChange(index);
  }, [index, open, onIndexChange]);

  // Esc + flechas
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setIndex((i) => (i > 0 ? i - 1 : i));
      } else if (e.key === 'ArrowRight') {
        setIndex((i) => (i < items.length - 1 ? i + 1 : i));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, items.length, onClose]);

  // Foco al contenedor al abrir
  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.focus();
    }
  }, [open]);

  if (!open || items.length === 0) return null;

  const current = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const content = (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de medios"
    >
      <button
        type="button"
        className={styles.closeBtn}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Cerrar"
      >
        ×
      </button>

      {items.length > 1 && (
        <span className={styles.counter}>
          {index + 1} / {items.length}
        </span>
      )}

      {hasPrev && (
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navPrev}`}
          onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1); }}
          aria-label="Anterior"
        >
          ‹
        </button>
      )}

      <div
        ref={containerRef}
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {current.type === 'video' ? (
          <video
            src={current.url}
            className={styles.media}
            controls
            autoPlay
            muted
            playsInline
            aria-label={current.alt || 'Vídeo'}
          />
        ) : (
          <img
            src={current.url}
            alt={current.alt || ''}
            className={styles.media}
          />
        )}
      </div>

      {hasNext && (
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navNext}`}
          onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1); }}
          aria-label="Siguiente"
        >
          ›
        </button>
      )}
    </div>
  );

  return createPortal(content, document.body);
}