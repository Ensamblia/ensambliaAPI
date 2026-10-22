// src/components/multimedia/MultimediaPreview.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MultimediaPreview } from './MultimediaPreview';
import userEvent from '@testing-library/user-event';

describe('MultimediaPreview', () => {
  it('no renderiza nada si multimedia es null', () => {
    const { container } = render(<MultimediaPreview multimedia={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('imagen: renderiza img con src y alt', () => {
    render(
      <MultimediaPreview
        multimedia={{
          multimedia_id: 1,
          nombre: 'foto.jpg',
          archivo_url: 'http://x/1.jpg',
          tipo_mime: 'image/jpeg',
          tamano_bytes: 1024,
        }}
      />,
    );
    const img = screen.getByRole('img', { name: 'foto.jpg' });
    expect(img).toHaveAttribute('src', 'http://x/1.jpg');
  });

  it('audio: renderiza audio controls y nombre', () => {
    render(
      <MultimediaPreview
        multimedia={{
          multimedia_id: 1,
          nombre: 'cancion.mp3',
          archivo_url: 'http://x/1.mp3',
          tipo_mime: 'audio/mpeg',
          tamano_bytes: 2 * 1024 * 1024,
        }}
      />,
    );
    expect(screen.getByText('cancion.mp3')).toBeInTheDocument();
    expect(document.querySelector('audio')).toBeInTheDocument();
    expect(screen.getByText('2.0 MB')).toBeInTheDocument();
  });

  it('vídeo: renderiza video controls', () => {
    render(
      <MultimediaPreview
        multimedia={{
          multimedia_id: 1,
          nombre: 'clip.mp4',
          archivo_url: 'http://x/1.mp4',
          tipo_mime: 'video/mp4',
          tamano_bytes: 1024,
        }}
      />,
    );
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('documento: renderiza icono, nombre, tipo y botón Abrir', () => {
    render(
      <MultimediaPreview
        multimedia={{
          multimedia_id: 1,
          nombre: 'doc.pdf',
          archivo_url: 'http://x/1.pdf',
          tipo_mime: 'application/pdf',
          tamano_bytes: 512,
        }}
      />,
    );
    expect(screen.getByText('📕')).toBeInTheDocument();
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
    expect(screen.getByText(/PDF/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Abrir/i })).toHaveAttribute('href', 'http://x/1.pdf');
  });
});

// ── Lightbox (G.2.bis) ──
describe('MultimediaPreview — lightbox', () => {
  const img = {
    multimedia_id: 1,
    nombre: 'foto.jpg',
    archivo_url: 'http://x/1.jpg',
    tipo_mime: 'image/jpeg',
    tamano_bytes: 1024,
  };

  const img2 = {
    multimedia_id: 2,
    nombre: 'foto2.jpg',
    archivo_url: 'http://x/2.jpg',
    tipo_mime: 'image/jpeg',
    tamano_bytes: 1024,
  };

  it('sin allMultimedia: imagen NO clickable', () => {
    render(<MultimediaPreview multimedia={img} />);
    expect(screen.queryByRole('button', { name: /Ampliar/i })).not.toBeInTheDocument();
  });

  it('con allMultimedia: imagen clickable y abre lightbox', async () => {
    const user = userEvent.setup();
    render(
      <MultimediaPreview
        multimedia={img}
        allMultimedia={[img, img2]}
        initialIndex={0}
      />,
    );
    const btn = screen.getByRole('button', { name: /Ampliar foto.jpg/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(screen.getByRole('dialog', { name: /Visor de medios/i })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('con allMultimedia: flechas navegan', async () => {
    const user = userEvent.setup();
    render(
      <MultimediaPreview
        multimedia={img}
        allMultimedia={[img, img2]}
        initialIndex={0}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Ampliar foto.jpg/i }));
    // El lightbox abre en index 0
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    // Flecha derecha
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });
});