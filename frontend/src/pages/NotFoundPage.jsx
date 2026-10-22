// src/pages/NotFoundPage.jsx
import React from 'react';
import { Button } from '@/components/ui';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <span className={styles.eyebrow}>
        <span className={styles.dot} aria-hidden="true" />
        Error 404
      </span>

      <h1 className={styles.heading}>
        Página <span className={styles.accent}>no encontrada</span>
      </h1>

      <p className={styles.subtext}>
        La página que buscas no existe o se ha movido. Comprueba la dirección o vuelve al inicio.
      </p>

      <Button to="/" variant="dark" size="lg" className={styles.action}>
        ← Volver al inicio
      </Button>
    </main>
  );
}