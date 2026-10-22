// src/components/ui/Textarea/Textarea.jsx
import React, { forwardRef } from 'react';
import styles from './Textarea.module.css';

/**
 * Textarea. Acepta todas las props nativas de <textarea>.
 *
 * @param {Object} props
 * @param {string} [props.className]
 */
export const Textarea = forwardRef(function Textarea(
  { className = '', ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
});