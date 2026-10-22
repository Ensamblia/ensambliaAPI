// src/components/ui/SectionLabel/SectionLabel.jsx
import React from 'react';
import styles from './SectionLabel.module.css';

/**
 * Etiqueta de sección (la píldora pequeña de "MATCH REAL", "MARKETPLACE"…).
 *
 * @param {Object} props
 * @param {'yellow'|'green'|'blue'|'purple'|'coral'|'dark'} [props.tone='yellow']
 * @param {string} [props.className]
 */
export function SectionLabel({ tone = 'yellow', className = '', children, ...rest }) {
  const classes = [styles.root, styles[tone], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}