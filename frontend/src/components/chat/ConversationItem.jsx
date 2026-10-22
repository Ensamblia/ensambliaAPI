// src/components/chat/ConversationItem.jsx
import React from 'react';
import { Avatar, Badge } from '@/components/ui';
import styles from './ConversationItem.module.css';

export function ConversationItem({
  nombre,
  preview,
  unread = 0,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={[styles.item, active ? styles.itemActive : ''].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <Avatar name={nombre} size="md" />
      <div className={styles.meta}>
        <span className={styles.nombre}>{nombre}</span>
        <span className={styles.preview}>{preview}</span>
      </div>
      {unread > 0 && <Badge value={unread} variant="danger" size="sm" />}
    </button>
  );
}