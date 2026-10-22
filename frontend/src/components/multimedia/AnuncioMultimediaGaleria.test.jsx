// src/components/multimedia/AnuncioMultimediaGaleria.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnuncioMultimediaGaleria } from './AnuncioMultimediaGaleria';

// Mock de MultimediaPreview para no renderizar imágenes reales.
vi.mock('./MultimediaPreview', () => ({
  MultimediaPreview: ({ multimedia }) => (
    <div data-testid={`media-${multimedia.multimedia_id}`}>{multimedia.nombre}</div>
  ),
}));

describe('AnuncioMultimediaGaleria', () => {
  it('no renderiza nada si no hay multimedia', () => {
    const { container } = render(<AnuncioMultimediaGaleria multimedias={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza un item por multimedia', () => {
    const multimedias = [
      { multimedia_id: 1, nombre: 'a.jpg' },
      { multimedia_id: 2, nombre: 'b.jpg' },
    ];
    render(<AnuncioMultimediaGaleria multimedias={multimedias} />);
    expect(screen.getByTestId('media-1')).toBeInTheDocument();
    expect(screen.getByTestId('media-2')).toBeInTheDocument();
  });

  it('muestra el contador en el título', () => {
    const multimedias = [
      { multimedia_id: 1, nombre: 'a.jpg' },
      { multimedia_id: 2, nombre: 'b.jpg' },
      { multimedia_id: 3, nombre: 'c.jpg' },
    ];
    render(<AnuncioMultimediaGaleria multimedias={multimedias} />);
    expect(screen.getByText(/Multimedia \(3\)/i)).toBeInTheDocument();
  });
});