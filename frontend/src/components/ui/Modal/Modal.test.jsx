// src/components/ui/Modal/Modal.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('no renderiza nada si open=false', () => {
    render(<Modal open={false} onClose={() => {}} title="X">Contenido</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el diálogo si open=true', () => {
    render(<Modal open onClose={() => {}} title="Confirmar">Contenido</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('llama a onClose al hacer click en ×', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal open onClose={onClose} title="X">C</Modal>);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose al pulsar Esc', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal open onClose={onClose} title="X">C</Modal>);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('NO llama a onClose con Esc si closeOnEsc=false', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal open onClose={onClose} closeOnEsc={false} title="X">C</Modal>);
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('llama a onClose al hacer click en el backdrop', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Modal open onClose={onClose} title="X">C</Modal>);
    // El overlay es el primer hijo del body (por el portal)
    const overlay = container.ownerDocument.body.querySelector('[role="presentation"]');
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('NO cierra al hacer click dentro del card', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal open onClose={onClose} title="X">Contenido</Modal>);
    await user.click(screen.getByText('Contenido'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renderiza footer si se pasa', () => {
    render(
      <Modal open onClose={() => {}} title="X" footer={<button>Guardar</button>}>
        C
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('bloquea el scroll del body mientras está abierto', () => {
    const { unmount } = render(<Modal open onClose={() => {}} title="X">C</Modal>);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    // Tras desmontar, se restaura
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});