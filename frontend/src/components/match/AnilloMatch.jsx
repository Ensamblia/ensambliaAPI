// src/components/match/AnilloMatch.jsx
import React from 'react';
import styles from './AnilloMatch.module.css';

/** Anillo de compatibilidad con el porcentaje en el centro. */
export function AnilloMatch({ valor, tono = 'claro', size = 64 }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={[styles.anillo, styles[tono]].join(' ')}
      style={{ width: size, height: size, fontSize: size * 0.26 }}
      role="img"
      aria-label={`${valor}% de compatibilidad`}
    >
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={r} className={styles.fondo} />
        <circle
          cx="40"
          cy="40"
          r={r}
          className={styles.valor}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - valor / 100)}
        />
      </svg>
      <span aria-hidden="true">{valor}%</span>
    </div>
  );
}
