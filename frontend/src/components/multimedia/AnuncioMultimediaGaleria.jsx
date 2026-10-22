// src/components/multimedia/AnuncioMultimediaGaleria.jsx
import React from 'react';
import { Card } from '@/components/ui';
import { MultimediaPreview } from './MultimediaPreview';
import styles from './AnuncioMultimediaGaleria.module.css';

export function AnuncioMultimediaGaleria({ multimedias = [] }) {
  if (!multimedias || multimedias.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <p className={styles.sectionTitle}>
        Multimedia ({multimedias.length})
      </p>
      <div className={styles.grid}>
        {multimedias.map((m, idx) => (
  <Card key={m.multimedia_id} className={styles.item} padding="none">
    <MultimediaPreview
      multimedia={m}
      allMultimedia={multimedias}
      initialIndex={idx}
    />
  </Card>
))}
      </div>
    </section>
  );
}