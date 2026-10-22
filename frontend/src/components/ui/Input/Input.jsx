// src/components/ui/Input/Input.jsx
import React, { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Input de texto. Acepta todas las props nativas de <input>.
 * Si se usa dentro de <Field>, este le inyecta id/aria-*.
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 */
export const Input = forwardRef(function Input(
  { size = 'md', className = '', type = 'text', ...rest },
  ref,
) {
  const classes = [styles.root, styles[size], className]
    .filter(Boolean)
    .join(' ');

  return <input ref={ref} type={type} className={classes} {...rest} />;
});