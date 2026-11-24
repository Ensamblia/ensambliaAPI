// src/components/cards/AnuncioCardSkeleton.jsx
import React from 'react';
import { Skeleton } from '@/components/ui';
import styles from './AnuncioCard.module.css';


export function AnuncioCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 16,
      }}
    >
      <div className={styles.body}>
        <div className={styles.top}>
          <Skeleton width="30%" height="1.4rem" radius={999} />
          <Skeleton width="22%" height="0.9rem" />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 'calc(var(--fs-lg) * 1.3)',
          }}
        >
          <Skeleton width="85%" height="0.95rem" />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            height: 'calc(var(--fs-base) * 1.6 * 2)',
          }}
        >
          <Skeleton height="0.8rem" />
          <Skeleton width="70%" height="0.8rem" />
        </div>
        <div className={styles.footer}>
          <Skeleton width="35%" height="1rem" />
          <Skeleton width="30%" height="1.8rem" />
        </div>
      </div>
    </div>
  );
}