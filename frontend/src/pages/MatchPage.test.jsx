import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { MatchPage } from './MatchPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const MARTA = {
  perfil_id: 9, nombre: 'Marta', apellido: 'Ruiz', tipo: 'usuario', descripcion: 'Batería',
  zona: 'Madrid', misma_comarca: true, generos_comunes: ['Rock'], instrumentos: ['Batería'], local: null,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <MatchPage />
    </MemoryRouter>,
  );
}

describe('MatchPage', () => {
  beforeEach(() => navigateMock.mockClear());

  it('por defecto busca músicos y muestra los motivos de cada match', async () => {
    const urls = [];
    server.use(
      http.get(`${API}/match/`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json({ count: 1, results: [MARTA] });
      }),
    );
    renderPage();
    const enlace = await screen.findByRole('link', { name: 'Marta Ruiz' });
    expect(enlace).toHaveAttribute('href', '/perfiles/9');
    expect(screen.getByText('En tu comarca (Madrid)')).toBeInTheDocument();
    expect(screen.getByText('Comparte Rock')).toBeInTheDocument();
    expect(screen.getByText('Toca Batería')).toBeInTheDocument();
    expect(urls[0].searchParams.get('busco')).toBe('musico');
    expect(screen.getByRole('button', { name: 'Busco músico' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('cambiar a "Busco local para tocar" pide busco=tocar y oculta el filtro de instrumento', async () => {
    const urls = [];
    server.use(
      http.get(`${API}/match/`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json({ count: 0, results: [] });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await screen.findByLabelText(/Instrumento/i);
    await user.click(screen.getByRole('button', { name: 'Busco local para tocar' }));
    await waitFor(() => expect(urls[urls.length - 1].searchParams.get('busco')).toBe('tocar'));
    expect(screen.queryByLabelText(/Instrumento/i)).not.toBeInTheDocument();
  });

  it('elegir instrumento al buscar músico lo envía', async () => {
    const urls = [];
    server.use(
      http.get(`${API}/match/`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json({ count: 0, results: [] });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('option', { name: 'Guitarra' });
    await user.selectOptions(screen.getByLabelText(/Instrumento/i), '1');
    await waitFor(() => expect(urls[urls.length - 1].searchParams.get('instrumento')).toBe('1'));
  });

  it('Contactar abre el chat con esa persona', async () => {
    server.use(http.get(`${API}/match/`, () => HttpResponse.json({ count: 1, results: [MARTA] })));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /Contactar/i }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/chat?chat=99'));
  });

  it('sin perfil invita a crearlo', async () => {
    server.use(
      http.get(`${API}/match/`, () =>
        HttpResponse.json({ error: 'Crea tu perfil para ver tus matches' }, { status: 400 }),
      ),
    );
    renderPage();
    expect(await screen.findByText('Crea tu perfil para ver tus matches')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear mi perfil/i })).toHaveAttribute('href', '/perfil');
  });

  it('sin resultados muestra un estado vacío', async () => {
    server.use(http.get(`${API}/match/`, () => HttpResponse.json({ count: 0, results: [] })));
    renderPage();
    expect(await screen.findByText(/Todavía no hay matches/i)).toBeInTheDocument();
  });
});
