import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PerfilPage } from './PerfilPage';
import { PerfilProvider } from '@/context/PerfilContext';

// Mock de los componentes que no queremos montar (FileUploader, MediaGallery, MisAnuncios)
vi.mock('@/components/multimedia/FileUploader', () => ({
  FileUploader: () => <div data-testid="file-uploader" />,
}));
vi.mock('@/components/multimedia/MediaGallery', () => ({
  MediaGallery: () => <div data-testid="media-gallery" />,
}));
vi.mock('@/components/anuncios/MisAnuncios', () => ({
  MisAnuncios: () => <div data-testid="mis-anuncios" />,
}));

function renderPerfil() {
  return render(
    <AuthProvider>
      <PerfilProvider>
        <MemoryRouter>
          <PerfilPage />
        </MemoryRouter>
      </PerfilProvider>
    </AuthProvider>,
  );
}

describe('PerfilPage — testimonio', () => {
  it('renderiza el campo "Tu testimonio sobre Ensamblia"', async () => {
    renderPerfil();
    await waitFor(() => {
      expect(screen.getByLabelText(/Tu testimonio sobre Ensamblia/i)).toBeInTheDocument();
    });
  });
});

it('muestra el botón "Cambiar foto"', async () => {
  renderPerfil();
  await waitFor(() => {
    expect(screen.getByText(/Cambiar foto/i)).toBeInTheDocument();
  });
});