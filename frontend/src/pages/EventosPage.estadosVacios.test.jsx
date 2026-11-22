// src/pages/EventosPage.estadosVacios.test.jsx
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { EventosPage } from './EventosPage';

const hoy = new Date();
const dia15 = new Date(hoy.getFullYear(), hoy.getMonth(), 15, 21, 0);

const CONCIERTO = {
  evento_id: 4, titulo: 'Concierto de otoño', descripcion: '', fecha_inicio: dia15.toISOString(),
  precio: '10 €', lugar: '', ciudad_id: 3, ciudad: 'Getafe', comarca_id: 1,
  autor: { perfil_id: 7, nombre: 'Sala Rock', apellido: '', tipo: 'local' },
  local: { perfil_id: 7, nombre: 'Sala Rock' }, generos: [{ genero_musical_id: 1, nombre: 'Rock' }],
};

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <EventosPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('EventosPage: estados vacíos', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API}/ciudades/`, () =>
        HttpResponse.json([{ ciudad_id: 3, nombre: 'Getafe', comarca_id: 1 }]),
      ),
    );
  });

  it('sin filtros y sin eventos en el mes, invita a añadir uno', async () => {
    server.use(http.get(`${API}/eventos/`, () => HttpResponse.json({ count: 0, results: [] })));
    renderPage();
    expect(await screen.findByText('No hay eventos este mes')).toBeInTheDocument();
    // Sale el botón de la cabecera y el del aviso
    expect(screen.getAllByText('Añadir evento').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText('Quitar filtros')).not.toBeInTheDocument();
  });

  it('con filtros y sin resultados, ofrece quitar los filtros', async () => {
    server.use(http.get(`${API}/eventos/`, () => HttpResponse.json({ count: 0, results: [] })));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('No hay eventos este mes');
    await screen.findByRole('option', { name: 'Getafe' });

    const ciudad = screen.getByLabelText(/Filtrar eventos por ciudad/i);
    await user.selectOptions(ciudad, '3');

    expect(await screen.findByText('Ningún evento con estos filtros')).toBeInTheDocument();
    await user.click(screen.getByText('Quitar filtros'));

    expect(await screen.findByText('No hay eventos este mes')).toBeInTheDocument();
    expect(ciudad).toHaveValue('');
  });

  it('un día sin eventos ofrece volver a ver todo el mes', async () => {
    server.use(http.get(`${API}/eventos/`, () => HttpResponse.json({ count: 1, results: [CONCIERTO] })));
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('link', { name: 'Concierto de otoño' });

    await user.click(screen.getByRole('button', { name: /^20(\s|$)/ }));

    expect(await screen.findByText('No hay eventos este día')).toBeInTheDocument();
    await user.click(screen.getByText('Ver todo el mes'));

    expect(await screen.findByRole('link', { name: 'Concierto de otoño' })).toBeInTheDocument();
  });
});