import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('PerfilPage — subir la foto de perfil', () => {
  const MINIO = 'http://127.0.0.1:9000/ensamblia-media/multimedia/avatars/x.png';
  const foto = () => new File(['png'], 'foto.png', { type: 'image/png' });
  // MinIO está en otro origen: jsdom aplica CORS a la subida con XMLHttpRequest
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT',
    'Access-Control-Allow-Headers': 'Content-Type, x-amz-acl',
  };

  beforeEach(() => {
    localStorage.setItem('ensamblia_token', 'tok');
    localStorage.setItem('ensamblia_usuario', 'ana');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(
      http.post(`${API}/perfiles/presigned-avatar/`, () =>
        HttpResponse.json({ upload_url: MINIO, object_key: 'multimedia/avatars/x.png' }),
      ),
      http.options(MINIO, () => new HttpResponse(null, { status: 204, headers: CORS })),
      http.put(MINIO, () => new HttpResponse(null, { status: 200, headers: CORS })),
      http.post(`${API}/perfiles/1/set-avatar/`, () => HttpResponse.json({ perfil_id: 1 })),
    );
  });

  async function subirFoto() {
    const { container } = renderPerfil();
    await screen.findByDisplayValue('Ana');
    await userEvent.upload(container.querySelector('#foto-input'), foto());
  }

  it('si todo va bien avisa de que la foto se ha actualizado', async () => {
    await subirFoto();
    expect(await screen.findByText('Foto actualizada.')).toBeInTheDocument();
  });

  it('muestra el motivo del backend si no deja preparar la subida', async () => {
    server.use(
      http.post(`${API}/perfiles/presigned-avatar/`, () =>
        HttpResponse.json({ error: 'Solo se aceptan imágenes para la foto de perfil' }, { status: 400 }),
      ),
    );
    await subirFoto();
    expect(await screen.findByText('Solo se aceptan imágenes para la foto de perfil')).toBeInTheDocument();
  });

  it('avisa si falla el envío de la imagen a MinIO', async () => {
    server.use(http.put(MINIO, () => new HttpResponse('<Code>InvalidAccessKeyId</Code>', { status: 403, headers: CORS })));
    await subirFoto();
    expect(await screen.findByText(/No se pudo enviar la imagen al almacenamiento/i)).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      'No se pudo subir la foto (paso: enviar)',
      expect.objectContaining({ message: expect.stringContaining('InvalidAccessKeyId') }),
    );
  });

  it('avisa si la imagen se subió pero no se pudo guardar en el perfil', async () => {
    server.use(
      http.post(`${API}/perfiles/1/set-avatar/`, () => HttpResponse.json({}, { status: 500 })),
    );
    await subirFoto();
    expect(await screen.findByText(/La imagen se subió, pero no se pudo guardar en tu perfil/i)).toBeInTheDocument();
  });
});
