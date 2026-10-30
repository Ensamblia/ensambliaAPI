// src/components/ui/PageHeader/PageHeader.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './PageHeader.module.css';

/**
 * Cabecera de página: back opcional + título + subtítulo + acciones.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.actions]
 * @param {string} [props.backTo]
 * @param {string} [props.backLabel='Volver']
 * @param {boolean} [props.backHistory] si hay historial en la app, vuelve a la página anterior en vez de a backTo
 * @param {string} [props.className]
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  backTo,
  backLabel = 'Volver',
  backHistory = false,
  className = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  // key 'default' = se entró directamente por URL: no hay página anterior propia
  const volverAtras = backHistory && location.key !== 'default';

  return (
    <header className={[styles.root, className].filter(Boolean).join(' ')}>
      {backTo && (
        <Link
          to={backTo}
          className={styles.back}
          onClick={volverAtras ? (e) => { e.preventDefault(); navigate(-1); } : undefined}
        >
          <span aria-hidden="true">←</span> {backLabel}
        </Link>
      )}
      <div className={styles.row}>
        <div className={styles.textBlock}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}