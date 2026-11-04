// src/components/ui/Chip/Chip.jsx
import React from 'react';
import styles from './Chip.module.css';

/**
 * Píldora de filtro (activa en tinta, como las de la landing).
 *
 * @param {Object} props
 * @param {boolean} [props.active=false]
 * @param {'ink'|'green'|'yellow'} [props.activeTone='ink']
 * @param {Function} [props.onClick]
 * @param {string} [props.className]
 */
export function Chip({ active = false, activeTone = 'ink', className = '', children, ...rest }) {
  const classes = [styles.root, active ? styles[`active_${activeTone}`] : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={classes} aria-pressed={active} {...rest}>
      {children}
    </button>
  );
}
