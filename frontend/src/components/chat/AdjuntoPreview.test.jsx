// src/components/chat/AdjuntoPreview.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdjuntoPreview } from './AdjuntoPreview';

const imgAdjunto = {
  adjunto_id: 1,
  nombre: 'foto.jpg',
  archivo_url: 'http://x/1.jpg',
  content_type: 'image/jpeg',
  tamano_bytes: 1024,
};

const videoAdjunto = {
  adjunto_id: 2,
  nombre: 'clip.mp4',
  archivo_url: 'http://x/1.mp4',
  content_type: 'video/mp4',
  tamano_bytes: 2 * 1024 * 1024,
};

const pdfAdjunto = {
  adjunto_id: 3,
  nombre: 'doc.pdf',
  archivo_url: 'http://x/1.pdf',
  content_type: 'application/pdf',
  tamano_bytes: 512,
};

describe('AdjuntoPreview', () => {
  it('imagen: renderiza img y botón de ampliar', () => {
    render(<AdjuntoPreview adjunto={imgAdjunto} />);
    expect(screen.getByRole('img', { name: 'foto.jpg' })).toHaveAttribute('src', 'http://x/1.jpg');
    expect(screen.getByRole('button', { name: /Ampliar foto.jpg/i })).toBeInTheDocument();
  });

  it('imagen: click abre lightbox', async () => {
    const user = userEvent.setup();
    render(<AdjuntoPreview adjunto={imgAdjunto} />);
    await user.click(screen.getByRole('button', { name: /Ampliar foto.jpg/i }));
    expect(screen.getByRole('dialog', { name: /Visor de medios/i })).toBeInTheDocument();
  });

  it('imagen con allAdjuntos: el lightbox tiene navegación', async () => {
    const user = userEvent.setup();
    const all = [imgAdjunto, videoAdjunto];
    render(
      <AdjuntoPreview adjunto={imgAdjunto} allAdjuntos={all} initialIndex={0} />,
    );
    await user.click(screen.getByRole('button', { name: /Ampliar foto.jpg/i }));
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('vídeo: renderiza video con controls (sin lightbox)', () => {
    render(<AdjuntoPreview adjunto={videoAdjunto} />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('controls');
  });

  it('audio: renderiza audio controls', () => {
    const audioAdjunto = { ...imgAdjunto, content_type: 'audio/mpeg', archivo_url: 'http://x/1.mp3' };
    render(<AdjuntoPreview adjunto={audioAdjunto} />);
    expect(document.querySelector('audio')).toBeInTheDocument();
  });

  it('documento: renderiza link con nombre y tamaño', () => {
    render(<AdjuntoPreview adjunto={pdfAdjunto} />);
    const link = screen.getByRole('link', { name: /doc.pdf/i });
    expect(link).toHaveAttribute('href', 'http://x/1.pdf');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('imagen con error: muestra placeholder', async () => {
    render(<AdjuntoPreview adjunto={imgAdjunto} />);
    const img = screen.getByRole('img', { name: 'foto.jpg' });
    // Simulamos error de carga
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.error(img);
    expect(screen.getByText(/Imagen no disponible/i)).toBeInTheDocument();
  });
});