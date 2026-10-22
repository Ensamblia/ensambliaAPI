// src/components/chat/MessageInput.jsx
import React, { useRef } from 'react';
import { Button, Input } from '@/components/ui';
import styles from './MessageInput.module.css';

export function MessageInput({
  value,
  onChange,
  onSend,
  adjuntosPendientes = [],
  onQuitarAdjunto,
  subiendoAdjunto = false,
  onAdjuntoChange,
}) {
  const inputFileRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.wrapper}>
      {adjuntosPendientes.length > 0 && (
        <div className={styles.pendientesBar}>
          {adjuntosPendientes.map((adj) => (
            <div key={adj.adjunto_id} className={styles.pendienteChip}>
              <span className={styles.pendienteNombre}>{adj.nombre}</span>
              <button
                type="button"
                className={styles.pendienteRemove}
                onClick={() => onQuitarAdjunto(adj.adjunto_id)}
                aria-label={`Quitar ${adj.nombre}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.inputRow}>
        <input
          ref={inputFileRef}
          type="file"
          multiple
          onChange={onAdjuntoChange}
          className={styles.hiddenInput}
        />
        <button
          type="button"
          className={styles.clipBtn}
          onClick={() => inputFileRef.current?.click()}
          disabled={subiendoAdjunto}
          aria-label="Adjuntar archivo"
          title="Adjuntar archivo"
        >
          {subiendoAdjunto ? '…' : '📎'}
        </button>
        <div className={styles.textInput}>
          <Input
            placeholder="Escribe un mensaje…"
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            aria-label="Escribir mensaje"
          />
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={onSend}
          disabled={subiendoAdjunto}
        >
          Enviar
        </Button>
      </div>
    </div>
  );
}