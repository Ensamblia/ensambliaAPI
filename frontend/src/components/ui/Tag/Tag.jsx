// src/components/ui/Tag/Tag.jsx
import React from 'react';
import styles from './Tag.module.css';

/**
 * Píldora de tipo/estado/género.
 *
 * @param {Object} props
 * @param {'yellow'|'green'|'blue'|'purple'|'coral'|'neutral'} [props.color='neutral']
 * @param {'sm'|'md'} [props.size='md']
 * @param {string} [props.className]
 */
export function Tag({
  color = 'neutral',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const classes = [styles.root, styles[color], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}