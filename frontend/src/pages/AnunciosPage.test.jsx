// src/pages/AnunciosPage.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { AnunciosPage } from './AnunciosPage';

vi.mock('@/components/perfil/AutorNombre', () => ({
  AutorNombre: ({ perfilId }) => <span>Autor {perfilId}</span>,
}));

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <AnunciosPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('AnunciosPage', () => {
  it('renderiza la cabecera y el contador', async () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Anuncios' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('3 anuncios')).toBeInTheDocument();
    });
  });

  it('renderiza las tarjetas de anuncios', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Busco batería para grupo de rock')).toBeInTheDocument();
      expect(screen.getByText('Vendo guitarra eléctrica')).toBeInTheDocument();
      expect(screen.getByText('Clases de piano')).toBeInTheDocument();
    });
  });

  it('al filtrar por búsqueda, el input se actualiza', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Busco batería para grupo de rock')).toBeInTheDocument();
    });
    const input = screen.getByRole('searchbox', { name: /Buscar anuncios/i });
    await user.type(input, 'guitarra');
    expect(input).toHaveValue('guitarra');
  });

  it('muestra EmptyState si no hay anuncios', async () => {
    server.use(
      http.get(`${API}/anuncios/`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
      ),
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    });
  });
});