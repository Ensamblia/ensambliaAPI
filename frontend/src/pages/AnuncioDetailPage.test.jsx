// src/pages/AnuncioDetailPage.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { AnuncioDetailPage } from './AnuncioDetailPage';

// Mock de AutorNombre
vi.mock('@/components/perfil/AutorNombre', () => ({
  AutorNombre: ({ perfilId }) => <span>Autor {perfilId}</span>,
}));

// Mock de Comentarios (tiene su propio test)
vi.mock('@/components/comentarios/Comentarios', () => ({
  Comentarios: () => <div data-testid="comentarios">Comentarios</div>,
}));

function renderDetail(id = 1) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/anuncios/${id}`]}>
        <Routes>
          <Route path="/anuncios/:id" element={<AnuncioDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

const anuncio = {
  anuncio_id: 1,
  titulo: 'Busco batería para grupo de rock',
  contenido: 'Grupo de rock alternativo en Madrid busca batería.',
  perfil_id: 1,
  tipo_anuncio_id: 1,
  fecha_publicacion: '2026-10-01T10:00:00Z',
  multimedias: [],
};

describe('AnuncioDetailPage', () => {
  it('carga y renderiza el anuncio', async () => {
    server.use(
      http.get(`${API}/anuncios/1/`, () => HttpResponse.json(anuncio)),
    );
    renderDetail(1);
    await waitFor(() => {
      expect(screen.getByText('Busco batería para grupo de rock')).toBeInTheDocument();
    });
    expect(screen.getByText(/Grupo de rock alternativo/i)).toBeInTheDocument();
    expect(screen.getByTestId('comentarios')).toBeInTheDocument();
  });

  it('muestra EmptyState si el anuncio no existe', async () => {
    server.use(
      http.get(`${API}/anuncios/999/`, () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );
    renderDetail(999);
    await waitFor(() => {
      expect(screen.getByText(/Este anuncio no existe/i)).toBeInTheDocument();
    });
  });

  it('muestra EmptyState si hay error de servidor', async () => {
    server.use(
      http.get(`${API}/anuncios/1/`, () =>
        HttpResponse.json({ error: 'Boom' }, { status: 500 }),
      ),
    );
    renderDetail(1);
    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el anuncio/i)).toBeInTheDocument();
    });
  });
});