// src/components/anuncios/MisAnuncios.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { MisAnuncios } from './MisAnuncios';

vi.mock('@/components/multimedia/EditarMediosModal', () => ({
  EditarMediosModal: ({ anuncio }) => (
    <div data-testid="editar-modal">Modal para {anuncio.anuncio_id}</div>
  ),
}));

function renderMisAnuncios(props = { perfilId: 1 }) {
  return render(
    <MemoryRouter>
      <MisAnuncios {...props} />
    </MemoryRouter>,
  );
}

describe('MisAnuncios', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('sin perfilId muestra EmptyState pidiendo guardar perfil', () => {
    renderMisAnuncios({ perfilId: null });
    expect(screen.getByText(/Guarda tu perfil primero/i)).toBeInTheDocument();
  });

  it('sin anuncios muestra EmptyState con CTA', async () => {
    server.use(
      http.get(`${API}/anuncios/`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
      ),
    );
    renderMisAnuncios();
    await waitFor(() => {
      expect(screen.getByText(/Aún no has publicado/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Crear anuncio/i })).toHaveAttribute(
      'href',
      '/anuncios/crear',
    );
  });

  it('con anuncios los lista con título y fecha', async () => {
    server.use(
      http.get(`${API}/anuncios/`, () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              anuncio_id: 5,
              titulo: 'Mi anuncio',
              fecha_publicacion: '2026-10-01T10:00:00Z',
              multimedias: [{ multimedia_id: 1 }],
            },
          ],
        }),
      ),
    );
    renderMisAnuncios();
    await waitFor(() => {
      expect(screen.getByText('Mi anuncio')).toBeInTheDocument();
    });
    expect(screen.getByText(/1 archivo/)).toBeInTheDocument();
  });

  it('click en "Multimedia" abre el modal', async () => {
    server.use(
      http.get(`${API}/anuncios/`, () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [{ anuncio_id: 5, titulo: 'Mi anuncio', multimedias: [] }],
        }),
      ),
    );
    const user = userEvent.setup();
    renderMisAnuncios();
    await waitFor(() => {
      expect(screen.getByText('Mi anuncio')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /Multimedia/i }));
    expect(screen.getByTestId('editar-modal')).toBeInTheDocument();
  });

  it('click en "Borrar" llama DELETE y quita el anuncio', async () => {
    server.use(
      http.get(`${API}/anuncios/`, () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [{ anuncio_id: 5, titulo: 'Mi anuncio', multimedias: [] }],
        }),
      ),
      http.delete(`${API}/anuncios/5/`, () => HttpResponse.json({})),
    );
    const user = userEvent.setup();
    renderMisAnuncios();
    await waitFor(() => {
      expect(screen.getByText('Mi anuncio')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /Borrar/i }));
    await waitFor(() => {
      expect(screen.queryByText('Mi anuncio')).not.toBeInTheDocument();
    });
  });
});