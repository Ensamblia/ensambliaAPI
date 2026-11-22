// src/components/locales/LocalCardSkeleton.jsx
import React from 'react';
import { Card, Skeleton } from '@/components/ui';
import styles from './LocalCard.module.css';

export function LocalCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Card className={styles.card} padding="md">
        <div style={{ display: 'flex', alignItems: 'center', height: 'calc(var(--fs-lg) * 1.4)' }}>
          <Skeleton width="60%" height="1rem" />
        </div>
        <div className={styles.meta}>
          <Skeleton width="25%" height="0.8rem" />
          <Skeleton width="20%" height="0.8rem" />
        </div>
        <div className={styles.tipos}>
          <Skeleton width="4.5rem" height="1.4rem" radius={999} />
          <Skeleton width="3.5rem" height="1.4rem" radius={999} />
        </div>
      </Card>
    </div>
  );
}