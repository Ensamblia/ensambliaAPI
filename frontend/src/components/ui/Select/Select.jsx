// src/components/ui/Select/Select.jsx
import React, { forwardRef } from 'react';
import styles from './Select.module.css';

/**
 * Select nativo con flecha custom. Acepta todas las props nativas de <select>.
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 */
export const Select = forwardRef(function Select(
  { size = 'md', className = '', children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <select ref={ref} className={classes} {...rest}>
      {children}
    </select>
  );
});