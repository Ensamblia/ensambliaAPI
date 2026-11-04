// src/components/filters/PanelFiltros.jsx
// En escritorio los filtros se ven en línea, como siempre. En móvil se pliegan
// tras un botón "Filtros" con el número de filtros activos, para no apilar
// 5 o 6 controles antes del primer resultado (#79).
import React, { useId, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import styles from './PanelFiltros.module.css';

export function PanelFiltros({ activos = 0, children }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-controls={id}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        Filtros
        {activos > 0 && (
          <span className={styles.count} aria-label={`${activos} activos`}>
            {activos}
          </span>
        )}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={[styles.chevron, abierto ? styles.chevronAbierto : ''].filter(Boolean).join(' ')}
        />
      </button>

      <div id={id} className={[styles.panel, abierto ? styles.panelAbierto : ''].filter(Boolean).join(' ')}>
        {children}
      </div>
    </>
  );
}
