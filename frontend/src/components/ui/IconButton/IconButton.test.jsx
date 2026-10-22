// src/components/ui/IconButton/IconButton.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renderiza un botón con aria-label', () => {
    render(
      <IconButton aria-label="Cerrar">
        <span aria-hidden="true">×</span>
      </IconButton>,
    );
    const btn = screen.getByRole('button', { name: 'Cerrar' });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('llama a onClick', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton aria-label="Más" onClick={onClick}>⋯</IconButton>);
    await user.click(screen.getByRole('button', { name: 'Más' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respeta disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton aria-label="No" onClick={onClick} disabled>×</IconButton>);
    const btn = screen.getByRole('button', { name: 'No' });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica clases de tamaño y variante', () => {
    render(<IconButton aria-label="Borrar" size="lg" variant="danger">×</IconButton>);
    const btn = screen.getByRole('button', { name: 'Borrar' });
    expect(btn.className).toMatch(/lg/);
    expect(btn.className).toMatch(/danger/);
  });
});