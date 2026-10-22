// src/components/chat/ChatHeader.jsx
import React from 'react';
import { Avatar } from '@/components/ui';
import styles from './ChatHeader.module.css';

export function ChatHeader({ nombre, wsConnected, otroOnline }) {
  const online = wsConnected && otroOnline;
  const label = !wsConnected ? 'Desconectado' : online ? 'En línea' : 'Ausente';

  return (
    <header className={styles.header}>
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