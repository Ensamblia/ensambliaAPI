// src/components/chat/ChatHeader.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/ui';
import styles from './ChatHeader.module.css';

// onBack: vuelve a la lista de conversaciones (el botón solo se ve en móvil)
export function ChatHeader({ nombre, wsConnected, otroOnline, onBack }) {
  const online = wsConnected && otroOnline;
  const label = !wsConnected ? 'Desconectado' : online ? 'En línea' : 'Ausente';

  return (
    <header className={styles.header}>
      {onBack && (
        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Volver a las conversaciones"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
      )}
      <Avatar name={nombre} size="md" />
      <div className={styles.info}>
        <span className={styles.nombre}>{nombre}</span>
        <span className={[styles.connectionBadge, online ? styles.connectionBadgeOnline : ''].filter(Boolean).join(' ')}>
          <span className={[styles.connectionDot, online ? styles.connectionDotOnline : ''].filter(Boolean).join(' ')} aria-hidden="true" />
          {label}
        </span>
      </div>
    </header>
  );
}