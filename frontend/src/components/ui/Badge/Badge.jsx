// src/components/ui/Badge/Badge.jsx
import React from 'react';
import styles from './Badge.module.css';

/**
 * Contador numérico. Si `value > max`, muestra `${max}+`.
 *
 * @param {Object} props
 * @param {number} props.value
 * @param {number} [props.max=99]
 * @param {'danger'|'accent'|'neutral'} [props.variant='danger']
 * @param {'sm'|'md'} [props.size='md']
 * @param {string} [props.className]
 */
export function Badge({
  value,
  max = 99,
  variant = 'danger',
  size = 'md',
  className = '',
  ...rest
}) {
  if (!value || value <= 0) return null;

  const display = value > max ? `${max}+` : String(value);

  const classes = [
    styles.root,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} aria-label={`${value} sin leer`} {...rest}>
      {display}
    </span>
  );
}