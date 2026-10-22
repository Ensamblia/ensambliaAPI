// src/components/ui/Modal/Modal.jsx
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBodyLock } from '@/hooks/useBodyLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import styles from './Modal.module.css';

/**
 * Diálogo modal con overlay.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {string} [props.title]
 * @param {React.ReactNode} [props.children]
 * @param {React.ReactNode} [props.footer]
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.closeOnBackdrop=true]
 * @param {boolean} [props.closeOnEsc=true]
 * @param {string} [props.className]
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = '',
}) {
  const cardRef = useRef(null);
  const titleId = useId();

  useBodyLock(open);
  useFocusTrap(cardRef, open);

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) onClose();
  };

  const content = (
    <div
      className={styles.overlay}
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={cardRef}
        className={[styles.card, styles[size], className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        <div className={styles.header}>
          {title ? (
            <h2 id={titleId} className={styles.title}>{title}</h2>
          ) : <span />}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {children && <div className={styles.body}>{children}</div>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}