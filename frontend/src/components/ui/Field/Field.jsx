// src/components/ui/Field/Field.jsx
import React, { useId } from 'react';
import styles from './Field.module.css';

/**
 * Wrapper de campo de formulario: label + control + error/hint.
 * Inyecta `id` y `aria-invalid`/`aria-describedby` al control hijo.
 *
 * El hijo debe ser un único elemento React (Input, Textarea, Select o un
 * control custom que acepte `id`, `aria-invalid`, `aria-describedby`).
 *
 * @param {Object} props
 * @param {string} [props.label]
 * @param {boolean} [props.required=false]
 * @param {string} [props.error]   - si existe, sustituye al hint
 * @param {string} [props.hint]
 * @param {string} [props.id]      - si no se pasa, se genera con useId
 * @param {React.ReactElement} props.children
 * @param {string} [props.className]
 */
export function Field({
  label,
  required = false,
  error = '',
  hint = '',
  id,
  children,
  className = '',
}) {
  const generatedId = useId();
  const controlId = id || `field-${generatedId}`;

  const errorId = error ? `${controlId}-error` : undefined;
  const hintId = hint && !error ? `${controlId}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const child = React.Children.only(children);
  const enhancedChild = React.cloneElement(child, {
    id: controlId,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    'aria-required': required || undefined,
  });

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={controlId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">*</span>
          )}
        </label>
      )}
      {enhancedChild}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}