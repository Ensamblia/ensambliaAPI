import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { CrearEventoPage } from './CrearEventoPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <CrearEventoPage />
    </MemoryRouter>,
  );
}

describe('CrearEventoPage', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    server.use(
      http.get(`${API}/ciudades/`, () => HttpResponse.json([{ ciudad_id: 3, nombre: 'Getafe', comarca_id: 1 }])),
      http.get(`${API}/eventos/mis-perfiles/`, () =>
        HttpResponse.json([
          { perfil_id: 2, nombre: 'Luis', apellido: 'Flotu', tipo: 'usuario' },
          { perfil_id: 7, nombre: 'Sala Rock', apellido: '', tipo: 'local' },
        ]),
      ),
    );
  });

  it('publica el evento con los datos del formulario y va a su detalle', async () => {
    let enviado = null;
    server.use(
      http.post(`${API}/eventos/`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({ evento_id: 11 }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('option', { name: 'Sala Rock (Local)' });
    await user.selectOptions(screen.getByLabelText(/Publicar como/i), '7');
    await user.type(screen.getByLabelText(/Título/i), 'Concierto de otoño');
    await user.type(screen.getByLabelText(/^Fecha/i), '2030-11-21');
    await user.type(screen.getByLabelText(/^Hora/i), '21:00');
    await user.selectOptions(screen.getByLabelText(/Local de Ensamblia/i), '7');
    await user.click(screen.getByLabelText('Rock'));
    await user.type(screen.getByLabelText(/Precio/i), '10 €');
    await user.click(screen.getByRole('button', { name: /Publicar evento/i }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/eventos/11'));
    expect(enviado).toMatchObject({
      perfil_id: 7, titulo: 'Concierto de otoño', local_id: 7, generos: [1], precio: '10 €',
    });
    expect(new Date(enviado.fecha_inicio).getTime()).toBe(new Date(2030, 10, 21, 21, 0).getTime());
    expect(enviado.ciudad_id).toBeUndefined();
  });

  it('sin local hay que elegir ciudad', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('option', { name: 'Getafe' });
    await user.type(screen.getByLabelText(/Título/i), 'Jam en el parque');
    await user.type(screen.getByLabelText(/^Fecha/i), '2030-11-21');
    await user.type(screen.getByLabelText(/^Hora/i), '18:00');
    await user.click(screen.getByRole('button', { name: /Publicar evento/i }));
    expect(await screen.findByText(/Elige la ciudad o un local/i)).toBeInTheDocument();
  });

  it('muestra el error del backend', async () => {
    server.use(
      http.post(`${API}/eventos/`, () =>
        HttpResponse.json({ fecha_inicio: ['La fecha del evento tiene que ser futura'] }, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('option', { name: 'Getafe' });
    await user.type(screen.getByLabelText(/Título/i), 'Jam');
    await user.type(screen.getByLabelText(/^Fecha/i), '2030-11-21');
    await user.type(screen.getByLabelText(/^Hora/i), '18:00');
    await user.selectOptions(screen.getByLabelText(/^Ciudad/i), '3');
    await user.click(screen.getByRole('button', { name: /Publicar evento/i }));
    expect(await screen.findByText('La fecha del evento tiene que ser futura')).toBeInTheDocument();
  });
});
