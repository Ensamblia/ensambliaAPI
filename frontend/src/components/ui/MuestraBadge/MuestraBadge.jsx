// src/components/ui/MuestraBadge/MuestraBadge.jsx
import React from 'react';
import { FlaskConical } from 'lucide-react';
import styles from './MuestraBadge.module.css';

/** Aviso de que la sección enseña datos de ejemplo (aún sin back). */
export function MuestraBadge({ children = 'Datos de ejemplo' }) {
  return (
    <span className={styles.root} title="Esta sección todavía no está conectada al servidor">
      <FlaskConical size={14} aria-hidden="true" />
      {children}
    </span>
  );
}
