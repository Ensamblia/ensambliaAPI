// src/pages/AnuncioDetailPage.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    server.use(
      http.get(`${API}/match/anuncios/:id/busqueda/`, ({ params }) =>
        HttpResponse.json({ anuncio_id: Number(params.id), tipo_perfil: null, instrumento_id: null, instrumento: null, generos: [], inferida: true }),
      ),
    );
  });

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

  it('muestra lo que busca el anuncio', async () => {
    server.use(
      http.get(`${API}/anuncios/1/`, () => HttpResponse.json(anuncio)),
      http.get(`${API}/match/anuncios/1/busqueda/`, () =>
        HttpResponse.json({
          anuncio_id: 1, tipo_perfil: 'usuario', instrumento_id: 2, instrumento: 'Batería',
          generos: [{ genero_musical_id: 1, nombre: 'Rock' }], inferida: false,
        }),
      ),
    );
    renderDetail(1);
    expect(await screen.findByText('Busca')).toBeInTheDocument();
    expect(screen.getByText('Músico')).toBeInTheDocument();
    expect(screen.getByText('Batería')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
  });

  it('si eres el autor ve los perfiles que encajan con su anuncio', async () => {
    localStorage.setItem('ensamblia_token', 'tok');
    localStorage.setItem('ensamblia_usuario', 'ana');
    server.use(
      http.get(`${API}/anuncios/1/`, () => HttpResponse.json(anuncio)),
      http.get(`${API}/match/anuncios/1/candidatos/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ perfil_id: 9, nombre: 'Marta', apellido: 'Ruiz', tipo: 'usuario', zona: 'Madrid',
            misma_comarca: true, generos_comunes: ['Rock'], instrumentos: ['Batería'], local: null }],
        }),
      ),
    );
    renderDetail(1);
    expect(await screen.findByRole('link', { name: 'Marta Ruiz' })).toHaveAttribute('href', '/perfiles/9');
    expect(screen.getByText('En tu comarca (Madrid)')).toBeInTheDocument();
  });

  it('si no eres el autor no enseña candidatos', async () => {
    localStorage.setItem('ensamblia_token', 'tok');
    localStorage.setItem('ensamblia_usuario', 'luis');
    server.use(
      http.get(`${API}/anuncios/1/`, () => HttpResponse.json(anuncio)),
      http.get(`${API}/match/anuncios/1/candidatos/`, () =>
        HttpResponse.json({ error: 'Solo el autor' }, { status: 403 }),
      ),
    );
    renderDetail(1);
    await screen.findByText('Busco batería para grupo de rock');
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.queryByText(/Perfiles que encajan/i)).not.toBeInTheDocument();
  });
});
