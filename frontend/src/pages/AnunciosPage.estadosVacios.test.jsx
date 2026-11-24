// src/pages/AnunciosPage.estadosVacios.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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


function respuestaVacia() {
  server.use(
    http.get(`${API}/anuncios/`, () =>
      HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
    ),
  );
}

describe('AnunciosPage: estados vacíos', () => {
  it('sin filtros y sin anuncios, invita a publicar el primero', async () => {
    respuestaVacia();
    renderPage();
    expect(await screen.findByText('Todavía no hay anuncios')).toBeInTheDocument();
    expect(screen.getByText('Publicar el primero')).toBeInTheDocument();
    expect(screen.queryByText('Quitar filtros')).not.toBeInTheDocument();
  });

  it('con filtros y sin resultados, ofrece quitar los filtros', async () => {
    const user = userEvent.setup();
    respuestaVacia();
    renderPage();
    await screen.findByText('Todavía no hay anuncios');

    await user.type(screen.getByRole('searchbox', { name: /Buscar anuncios/i }), 'zzzz');

    expect(
      await screen.findByText('Ningún anuncio con estos filtros', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Quitar filtros')).toBeInTheDocument();
    expect(screen.queryByText('Publicar el primero')).not.toBeInTheDocument();
  });

  it('el botón Quitar filtros vacía la búsqueda', async () => {
    const user = userEvent.setup();
    respuestaVacia();
    renderPage();
    await screen.findByText('Todavía no hay anuncios');

    await user.type(screen.getByRole('searchbox', { name: /Buscar anuncios/i }), 'zzzz');
    await user.click(await screen.findByText('Quitar filtros', {}, { timeout: 3000 }));

    expect(await screen.findByText('Todavía no hay anuncios', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /Buscar anuncios/i })).toHaveValue('');
  });
});