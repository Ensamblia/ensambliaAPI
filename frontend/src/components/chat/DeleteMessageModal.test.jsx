// src/components/chat/DeleteMessageModal.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteMessageModal } from './DeleteMessageModal';

describe('DeleteMessageModal', () => {
  it('renderiza el modal con preview', () => {
    render(
      <DeleteMessageModal
        open
        mensaje={{ contenido: 'Hola mundo' }}
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText(/¿Borrar mensaje?/i)).toBeInTheDocument();
    expect(screen.getByText('Hola mundo')).toBeInTheDocument();
  });

  it('"Borrar" llama onConfirm', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteMessageModal
        open
        mensaje={{ contenido: 'Hola' }}
        onClose={() => {}}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('"Cancelar" llama onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteMessageModal
        open
        mensaje={{ contenido: 'Hola' }}
        onClose={onClose}
        onConfirm={() => {}}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});