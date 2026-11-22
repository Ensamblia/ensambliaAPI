// src/components/eventos/EventoCardSkeleton.jsx
import React from 'react';
import { Skeleton } from '@/components/ui';
import styles from './EventoCard.module.css';

export function EventoCardSkeleton() {
  return (
    <article className={styles.card} aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <Skeleton width="64px" height="64px" radius={12} style={{ flexShrink: 0 }} />
      <div className={styles.cuerpo}>
        <div className={styles.tags}>
          <Skeleton width="4.5rem" height="1.4rem" radius={999} />
          <Skeleton width="3.5rem" height="1.4rem" radius={999} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: 'calc(var(--fs-lg) * 1.3)' }}>
          <Skeleton width="65%" height="0.95rem" />
        </div>
        <div className={styles.meta}>
          <Skeleton width="9rem" height="0.8rem" />
          <Skeleton width="7rem" height="0.8rem" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: 'calc(var(--fs-base) * 1.5)' }}>
          <Skeleton width="90%" height="0.8rem" />
        </div>
      </div>
    </article>
  );
}