// src/pages/LocalesPage.estadosVacios.test.jsx
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { LocalesPage } from './LocalesPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <LocalesPage />
    </MemoryRouter>,
  );
}

describe('LocalesPage: estados vacíos', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API}/ciudades/`, () =>
        HttpResponse.json([{ ciudad_id: 3, nombre: 'Getafe', comarca_id: 1 }]),
      ),
      http.get(`${API}/locales/`, () => HttpResponse.json({ count: 0, results: [] })),
    );
  });

  it('sin filtros y sin locales, dice que todavía no hay ninguno', async () => {
    renderPage();
    expect(await screen.findByText('Todavía no hay locales')).toBeInTheDocument();
    expect(screen.queryByText('Quitar filtros')).not.toBeInTheDocument();
  });

  it('con filtros y sin resultados, ofrece quitar los filtros', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todavía no hay locales');

    await user.type(screen.getByRole('searchbox', { name: /Buscar locales/i }), 'zzzz');

    expect(
      await screen.findByText('Ningún local con estos filtros', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Quitar filtros')).toBeInTheDocument();
    expect(screen.queryByText('Todavía no hay locales')).not.toBeInTheDocument();
  });

  it('el botón Quitar filtros vacía la búsqueda', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todavía no hay locales');

    await user.type(screen.getByRole('searchbox', { name: /Buscar locales/i }), 'zzzz');
    await user.click(await screen.findByText('Quitar filtros', {}, { timeout: 3000 }));

    expect(await screen.findByText('Todavía no hay locales', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /Buscar locales/i })).toHaveValue('');
  });
});