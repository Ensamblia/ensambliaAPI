// src/components/ui/Field/Field.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Field } from './Field';
import { Input } from '../Input/Input';

describe('Field', () => {
  it('asocia el label al input vía htmlFor/id', () => {
    render(
      <Field label="Usuario">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Usuario');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('marca required con asterisco y aria-required', () => {
    render(
      <Field label="Contraseña" required>
        <Input type="password" />
      </Field>,
    );
    const input = screen.getByLabelText(/contraseña/i);
    expect(input).toHaveAttribute('aria-required', 'true');
    // El asterisco es aria-hidden
    const asterisk = screen.getByText('*');
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('muestra el error con role=alert y aria-invalid', () => {
    render(
      <Field label="Email" error="Email no válido">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Email no válido');
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
  });

  it('muestra el hint cuando no hay error', () => {
    render(
      <Field label="Nombre" hint="Mínimo 3 caracteres">
        <Input />
      </Field>,
    );
    expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
    const input = screen.getByLabelText('Nombre');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('si hay error, no muestra el hint', () => {
    render(
      <Field label="Nombre" hint="Mínimo 3 caracteres" error="Campo obligatorio">
        <Input />
      </Field>,
    );
    expect(screen.queryByText('Mínimo 3 caracteres')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obligatorio');
  });

  it('respeta el id explícito', () => {
    render(
      <Field label="Usuario" id="mi-usuario">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Usuario');
    expect(input).toHaveAttribute('id', 'mi-usuario');
  });
});