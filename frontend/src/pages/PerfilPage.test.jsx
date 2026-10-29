import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PerfilPage } from './PerfilPage';
import { PerfilProvider } from '@/context/PerfilContext';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API } from '@/test/msw/handlers';

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
vi.mock('@/components/locales/DatosLocalForm', () => ({
  DatosLocalForm: () => <div data-testid="datos-local-form" />,
}));
vi.mock('@/components/locales/ArtistasSugeridos', () => ({
  ArtistasSugeridos: () => <div data-testid="artistas-sugeridos" />,
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
describe('PerfilPage — perfil nuevo de tipo local', () => {
  it('avisa de que los datos del local se añaden tras guardar', async () => {
    server.use(
      http.get(`${API}/perfiles/me/`, () =>
        HttpResponse.json({ detail: 'No encontrado' }, { status: 404 }),
      ),
    );
    renderPerfil();
    const select = await screen.findByDisplayValue(/Músico/i);
    expect(
      screen.queryByText(/Guarda el perfil y después podrás añadir los datos del local/i),
    ).not.toBeInTheDocument();
    await userEvent.selectOptions(select, 'local');
    expect(
      screen.getByText(/Guarda el perfil y después podrás añadir los datos del local/i),
    ).toBeInTheDocument();
  });
});

describe('PerfilPage — perfil de local guardado', () => {
  it('muestra el formulario de datos del local y los artistas sugeridos', async () => {
    server.use(
      http.get(`${API}/perfiles/me/`, () =>
        HttpResponse.json({
          perfil_id: 7,
          nombre: 'Sala Prueba',
          apellido: '',
          correo: 'sala@test.com',
          descripcion: 'Sala de conciertos',
          tipo: 'local',
          comarca_id: null,
        }),
      ),
    );
    renderPerfil();
    expect(await screen.findByTestId('datos-local-form')).toBeInTheDocument();
    expect(screen.getByTestId('artistas-sugeridos')).toBeInTheDocument();
  });
});
