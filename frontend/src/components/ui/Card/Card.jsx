// src/components/ui/Card/Card.jsx
import React, { forwardRef } from 'react';
import styles from './Card.module.css';

/**
 * Superficie base: borde, radius, fondo, sombra opcional.
 * Si `interactive`, es clickable y tiene hover.
 *
 * @param {Object} props
 * @param {'flat'|'raised'} [props.elevation='flat']
 * @param {boolean} [props.interactive=false]
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='none']
 * @param {string} [props.as='div']  - etiqueta HTML a renderizar
 * @param {string} [props.className]
 */
export const Card = forwardRef(function Card(
  {
    elevation = 'flat',
    interactive = false,
    padding = 'none',
    as: Tag = 'div',
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const paddingClass = {
    none: styles.paddingNone,
    sm: styles.paddingSm,
    md: styles.paddingMd,
    lg: styles.paddingLg,
  }[padding];

  const classes = [
    styles.root,
    styles[elevation],
    interactive ? styles.interactive : '',
    paddingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  );
});