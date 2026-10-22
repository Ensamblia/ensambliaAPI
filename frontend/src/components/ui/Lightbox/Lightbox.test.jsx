// src/components/ui/Lightbox/Lightbox.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from './Lightbox';

const items = [
  { id: 1, url: 'http://x/1.jpg', type: 'image', alt: 'Foto 1' },
  { id: 2, url: 'http://x/2.jpg', type: 'image', alt: 'Foto 2' },
  { id: 3, url: 'http://x/3.mp4', type: 'video', alt: 'Vídeo 3' },
];

describe('Lightbox', () => {
  it('no renderiza nada si open=false', () => {
    render(<Lightbox open={false} items={items} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('no renderiza nada si items está vacío', () => {
    render(<Lightbox open items={[]} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza la imagen del initialIndex', () => {
    render(<Lightbox open items={items} initialIndex={1} onClose={() => {}} />);
    expect(screen.getByRole('img', { name: 'Foto 2' })).toBeInTheDocument();
  });

  it('cierra al hacer click en ×', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Lightbox open items={items} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra con Esc', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Lightbox open items={items} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navega con flechas', async () => {
    const user = userEvent.setup();
    render(<Lightbox open items={items} onClose={() => {}} />);
    expect(screen.getByRole('img', { name: 'Foto 1' })).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('img', { name: 'Foto 2' })).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    // Ahora es vídeo
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('no navega más allá del último', async () => {
    const user = userEvent.setup();
    render(<Lightbox open items={items} initialIndex={items.length - 1} onClose={() => {}} />);
    await user.keyboard('{ArrowRight}');
    // Sigue en el último
    expect(screen.queryByRole('img')).not.toBeInTheDocument(); // vídeo
  });

  it('no navega antes del primero', async () => {
    const user = userEvent.setup();
    render(<Lightbox open items={items} initialIndex={0} onClose={() => {}} />);
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('img', { name: 'Foto 1' })).toBeInTheDocument();
  });

  it('muestra contador si hay más de 1', () => {
    render(<Lightbox open items={items} onClose={() => {}} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('renderiza vídeo con controles si type=video', () => {
    render(<Lightbox open items={items} initialIndex={2} onClose={() => {}} />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('controls');
  });

  it('bloquea el scroll del body mientras está abierto', () => {
    const { unmount } = render(<Lightbox open items={items} onClose={() => {}} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});