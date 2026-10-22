// src/components/ui/EmptyState/EmptyState.jsx
import React from 'react';
import styles from './EmptyState.module.css';

/**
 * Estado vacío: icono + título + descripción + acción opcional.
 * Útil para listas vacías, errores, "sin resultados", etc.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 * @param {boolean} [props.compact=false]
 * @param {string} [props.className]
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className = '',
}) {
  const classes = [
    styles.root,
    compact ? styles.compact : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}