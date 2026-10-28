import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('EventosPage', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API}/ciudades/`, () => HttpResponse.json([{ ciudad_id: 3, nombre: 'Getafe', comarca_id: 1 }])),
    );
  });

  it('pide los eventos del mes actual y los muestra en lista y calendario', async () => {
    const urls = [];
    server.use(
      http.get(`${API}/eventos/`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json({ count: 1, results: [CONCIERTO] });
      }),
    );
    renderPage();
    expect(await screen.findByRole('link', { name: 'Concierto de otoño' })).toHaveAttribute('href', '/eventos/4');
    expect(screen.getByText(/Sala Rock · Getafe/)).toBeInTheDocument();
    expect(screen.getByText('10 €')).toBeInTheDocument();
    const desde = new Date(urls[0].searchParams.get('desde'));
    expect(desde.getDate()).toBe(1);
    expect(desde.getMonth()).toBe(hoy.getMonth());
    expect(screen.getByRole('button', { name: /^15 .*1 evento/ })).toBeInTheDocument();
  });

  it('pulsar un día filtra la lista a ese día', async () => {
    const otro = { ...CONCIERTO, evento_id: 5, titulo: 'Jam del 20', fecha_inicio: new Date(hoy.getFullYear(), hoy.getMonth(), 20, 19).toISOString() };
    server.use(http.get(`${API}/eventos/`, () => HttpResponse.json({ count: 2, results: [CONCIERTO, otro] })));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Jam del 20');
    await user.click(screen.getByRole('button', { name: /^15 / }));
    const lista = screen.getByRole('list', { name: /Eventos/i });
    expect(within(lista).getByText('Concierto de otoño')).toBeInTheDocument();
    expect(within(lista).queryByText('Jam del 20')).not.toBeInTheDocument();
  });

  it('el botón de mes siguiente pide el mes siguiente', async () => {
    const urls = [];
    server.use(
      http.get(`${API}/eventos/`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json({ count: 0, results: [] });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(urls.length).toBe(1));
    await user.click(screen.getByRole('button', { name: /Mes siguiente/i }));
    await waitFor(() => expect(urls.length).toBe(2));
    const desde = new Date(urls[1].searchParams.get('desde'));
    expect(desde.getMonth()).toBe((hoy.getMonth() + 1) % 12);
  });

  it('sin eventos muestra un estado vacío', async () => {
    server.use(http.get(`${API}/eventos/`, () => HttpResponse.json({ count: 0, results: [] })));
    renderPage();
    expect(await screen.findByText(/No hay eventos este mes/i)).toBeInTheDocument();
  });
});
