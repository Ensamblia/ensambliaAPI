// src/components/ui/PageHeader/PageHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PageHeader.module.css';

/**
 * Cabecera de página: back opcional + icono de sección + título + subtítulo + acciones.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.actions]
 * @param {React.ReactNode} [props.icon]   - icono de la sección (cuadro de color)
 * @param {'yellow'|'green'|'blue'|'purple'|'coral'|'navy'|'paper'} [props.tone='yellow']
 * @param {React.ReactNode} [props.badge]  - etiqueta junto al título
 * @param {string} [props.backTo]
 * @param {string} [props.backLabel='Volver']
 * @param {string} [props.className]
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  icon,
  tone = 'yellow',
  badge,
  backTo,
  backLabel = 'Volver',
  className = '',
}) {
  return (
    <header className={[styles.root, className].filter(Boolean).join(' ')}>
      {backTo && (
        <Link to={backTo} className={styles.back}>
          <span aria-hidden="true">←</span> {backLabel}
        </Link>
      )}
      <div className={styles.row}>
        <div className={styles.lead}>
          {icon && (
            <span className={[styles.icon, styles[tone]].join(' ')} aria-hidden="true">
              {icon}
            </span>
          )}
          <div className={styles.textBlock}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{title}</h1>
              {badge}
            </div>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
