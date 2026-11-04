// src/components/ui/Avatar/Avatar.jsx
import React from 'react';
import styles from './Avatar.module.css';

/**
 * Avatar circular con inicial o icono.
 *
 * @param {Object} props
 * @param {string} [props.name]   - nombre para inicial + color determinista
 * @param {string} [props.src]    - imagen (si se pasa, prioridad sobre inicial)
 * @param {React.ReactNode} [props.icon] - icono si no hay name ni src
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 */
export function Avatar({
  name = '',
  src,
  icon,
  size = 'md',
  className = '',
  ...rest
}) {
  // Iniciales: primera letra de las dos primeras palabras ("Marga Ruiz" → "MR")
  const initial = (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('')
    .toUpperCase();

  // Color determinista a partir del nombre (consistente entre renders).
  const tone = (() => {
    if (!name) return 'toneNeutral';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    const idx = (Math.abs(hash) % 6) + 1;
    return `tone${idx}`;
  })();

  const classes = [styles.root, styles[size], styles[tone], className]
    .filter(Boolean)
    .join(' ');

  if (src) {
    return (
      <span className={classes} {...rest}>
        <img src={src} alt={name || ''} className={styles.image} />
      </span>
    );
  }

  return (
    <span className={classes} aria-label={name || undefined} {...rest}>
      {initial || icon || ''}
    </span>
  );
}