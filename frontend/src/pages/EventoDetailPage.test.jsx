import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { EventoDetailPage } from './EventoDetailPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const EVENTO = {
  evento_id: 4, titulo: 'Concierto de otoño', descripcion: 'Tres grupos locales',
  fecha_inicio: '2030-11-21T20:00:00Z', precio: 'Gratis', lugar: '', ciudad_id: 3, ciudad: 'Getafe', comarca_id: 1,
  autor: { perfil_id: 7, nombre: 'Sala Rock', apellido: '', tipo: 'local' },
  local: { perfil_id: 7, nombre: 'Sala Rock' }, generos: [{ genero_musical_id: 1, nombre: 'Rock' }],
};

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/eventos/4']}>
        <Routes>
          <Route path="/eventos/:id" element={<EventoDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('EventoDetailPage', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    localStorage.clear();
    server.use(http.get(`${API}/eventos/4/`, () => HttpResponse.json(EVENTO)));
  });

  it('muestra los datos del evento con enlaces al local y al autor', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Concierto de otoño' })).toBeInTheDocument();
    expect(screen.getByText('Tres grupos locales')).toBeInTheDocument();
    expect(screen.getByText('Gratis')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
    const enlaces = screen.getAllByRole('link', { name: 'Sala Rock' });
    enlaces.forEach((a) => expect(a).toHaveAttribute('href', '/perfiles/7'));
  });

  it('el autor puede borrar el evento', async () => {
    localStorage.setItem('ensamblia_token', 'tok');
    localStorage.setItem('ensamblia_usuario', 'luis');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    let borrado = false;
    server.use(
      http.get(`${API}/eventos/mis-perfiles/`, () => HttpResponse.json([{ perfil_id: 7, nombre: 'Sala Rock', tipo: 'local' }])),
      http.delete(`${API}/eventos/4/`, () => {
        borrado = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: /Borrar evento/i }));
    await waitFor(() => expect(borrado).toBe(true));
    expect(navigateMock).toHaveBeenCalledWith('/eventos');
  });

  it('quien no es el autor no ve el botón de borrar', async () => {
    localStorage.setItem('ensamblia_token', 'tok');
    localStorage.setItem('ensamblia_usuario', 'ana');
    server.use(
      http.get(`${API}/eventos/mis-perfiles/`, () => HttpResponse.json([{ perfil_id: 1, nombre: 'Ana', tipo: 'usuario' }])),
    );
    renderPage();
    await screen.findByRole('heading', { name: 'Concierto de otoño' });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('button', { name: /Borrar evento/i })).not.toBeInTheDocument();
  });

  it('evento inexistente', async () => {
    server.use(http.get(`${API}/eventos/4/`, () => HttpResponse.json({ error: 'x' }, { status: 404 })));
    renderPage();
    expect(await screen.findByText(/Este evento no existe/i)).toBeInTheDocument();
  });
});
