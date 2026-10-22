// src/components/ui/Spinner/Spinner.jsx
import React from 'react';
import styles from './Spinner.module.css';

/**
 * Indicador de carga.
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.inverted=false] - para fondos oscuros
 * @param {string} [props['aria-label']='Cargando']
 * @param {string} [props.className]
 */
export function Spinner({
  size = 'md',
  inverted = false,
  'aria-label': ariaLabel = 'Cargando',
  className = '',
}) {
  const classes = [styles.root, styles[size], inverted ? styles.inverted : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={classes}
    />
  );
}