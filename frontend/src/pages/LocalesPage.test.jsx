import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { LocalesPage } from './LocalesPage';
import { paramsDesdeFiltros } from '@/utils/tipoLocal';

const SALA = {
  perfil_id: 7,
  nombre: 'Sala Rock',
  descripcion: 'Conciertos',
  local: { ciudad_id: 3, ciudad: 'Getafe', comarca_id: 1, direccion: 'C/ Mayor 1', aforo: 200, tipos: ['sala', 'bar'] },
  generos: [1],
  misma_comarca: true,
  generos_comunes: 2,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <LocalesPage />
    </MemoryRouter>,
  );
}

describe('paramsDesdeFiltros', () => {
  it('ensayar pide solo locales de ensayo', () => {
    expect(paramsDesdeFiltros({ uso: 'ensayar' })).toEqual({ tipo: ['ensayo'] });
  });

  it('tocar pide sala, bar, teatro y otro', () => {
    expect(paramsDesdeFiltros({ uso: 'tocar' })).toEqual({ tipo: ['sala', 'bar', 'teatro', 'otro'] });
  });

  it('omite los filtros vacíos y recorta la búsqueda', () => {
    expect(
      paramsDesdeFiltros({ uso: '', comarca: '1', aforo_min: '', genero: '2', search: '  rock ' }),
    ).toEqual({ comarca: '1', genero: '2', search: 'rock' });
  });
});

describe('LocalesPage', () => {
  it('muestra los locales con su ciudad, aforo, tipos y afinidad', async () => {
    server.use(
      http.get(`${API}/locales/`, () => HttpResponse.json({ count: 1, results: [SALA] })),
    );
    renderPage();
    const link = await screen.findByRole('link', { name: 'Sala Rock' });
    expect(link).toHaveAttribute('href', '/perfiles/7');
    expect(screen.getByText('Getafe')).toBeInTheDocument();
    expect(screen.getByText('Aforo: 200')).toBeInTheDocument();
    expect(screen.getByText('Sala de conciertos')).toBeInTheDocument();
    expect(screen.getByText('En tu comarca · 2 estilos en común')).toBeInTheDocument();
    expect(screen.getByText('1 resultado')).toBeInTheDocument();
  });

  it('elegir "Tocar" busca salas, bares, teatros y otros', async () => {
    const urls = [];
    server.use(
      http.get(`${API}/locales/`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json({ count: 0, results: [] });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(urls.length).toBeGreaterThan(0));

    await user.selectOptions(screen.getByLabelText(/Para qué/i), 'tocar');
    await waitFor(() => {
      const ultima = urls[urls.length - 1];
      expect(ultima.searchParams.getAll('tipo')).toEqual(['sala', 'bar', 'teatro', 'otro']);
    });
  });

  it('sin resultados muestra un estado vacío', async () => {
    server.use(
      http.get(`${API}/locales/`, () => HttpResponse.json({ count: 0, results: [] })),
    );
    renderPage();
    expect(await screen.findByText(/No hay locales con esos filtros/i)).toBeInTheDocument();
  });

  it('si el servidor falla lo indica', async () => {
    server.use(
      http.get(`${API}/locales/`, () => HttpResponse.json({ error: 'x' }, { status: 500 })),
    );
    renderPage();
    expect(await screen.findByText(/No se pudo cargar/i)).toBeInTheDocument();
  });
});
