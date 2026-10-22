// src/components/chat/DeleteMessageModal.jsx
import React from 'react';
import { Button, Modal } from '@/components/ui';
import styles from './DeleteMessageModal.module.css';

export function DeleteMessageModal({ open, mensaje, onClose, onConfirm }) {
  if (!open || !mensaje) return null;

  const contenido = mensaje.contenido || '';
  const preview =
    contenido.length > 200 ? contenido.slice(0, 200) + '…' : contenido;

  return (
    <Modal
      open
      onClose={onClose}
      title="¿Borrar mensaje?"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" size="md" onClick={onConfirm}>
            Borrar
          </Button>
        </>
      }
    >
      <p className={styles.text}>
        Esta acción no se puede deshacer. El mensaje aparecerá como eliminado en
        el chat.
      </p>
      <div className={styles.preview}>
        {preview || '📎 Adjunto'}
      </div>
    </Modal>
  );
}