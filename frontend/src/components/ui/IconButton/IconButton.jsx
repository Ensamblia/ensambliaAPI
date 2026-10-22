// src/components/ui/IconButton/IconButton.jsx
import React from 'react';
import styles from './IconButton.module.css';

/**
 * Botón cuadrado solo icono.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - el icono (obligatorio)
 * @param {string} props['aria-label']     - nombre accesible (obligatorio)
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {'ghost'|'outline'|'danger'} [props.variant='ghost']
 * @param {string} [props.type='button']
 * @param {Function} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export function IconButton({
  children,
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'ghost',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  ...rest
}) {
  if (!ariaLabel) {
    // eslint-disable-next-line no-console
    console.warn('IconButton: falta aria-label (accesibilidad).');
  }

  const classes = [styles.root, styles[size], styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </button>
  );
}