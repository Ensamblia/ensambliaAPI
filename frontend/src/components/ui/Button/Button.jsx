// src/components/ui/Button/Button.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * Botón del design system. Puede renderizar como <button>, <a> o <Link>.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'secondary'|'ghost'|'danger'|'dark'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.block=false]
 * @param {string} [props.to]      - si se pasa, renderiza <Link to>
 * @param {string} [props.href]    - si se pasa, renderiza <a href>
 * @param {string} [props.type='button']
 * @param {Function} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  to,
  href,
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const classes = [
    styles.root,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    block ? styles.block : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-disabled={isDisabled} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} aria-disabled={isDisabled} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}