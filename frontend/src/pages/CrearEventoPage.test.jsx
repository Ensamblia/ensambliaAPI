import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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

describe('CrearEventoPage al editar', () => {
  const EVENTO = {
    evento_id: 4, titulo: 'Concierto de otoño', descripcion: 'Tres grupos', precio: 'Gratis',
    fecha_inicio: new Date(2030, 10, 21, 20, 30).toISOString(), lugar: '', ciudad_id: 3, ciudad: 'Getafe',
    comarca_id: 1, autor: { perfil_id: 7, nombre: 'Sala Rock', apellido: '', tipo: 'local' },
    local: { perfil_id: 7, nombre: 'Sala Rock' }, generos: [{ genero_musical_id: 1, nombre: 'Rock' }],
  };

  function renderEditar() {
    return render(
      <MemoryRouter initialEntries={['/eventos/4/editar']}>
        <Routes>
          <Route path="/eventos/:id/editar" element={<CrearEventoPage />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  beforeEach(() => {
    navigateMock.mockClear();
    server.use(
      http.get(`${API}/ciudades/`, () => HttpResponse.json([{ ciudad_id: 3, nombre: 'Getafe', comarca_id: 1 }])),
      http.get(`${API}/genero_musical/`, () =>
        HttpResponse.json([
          { genero_musical_id: 1, nombre: 'Rock' },
          { genero_musical_id: 2, nombre: 'Jazz' },
        ]),
      ),
      http.get(`${API}/eventos/mis-perfiles/`, () =>
        HttpResponse.json([
          { perfil_id: 2, nombre: 'Luis', apellido: 'Flotu', tipo: 'usuario' },
          { perfil_id: 7, nombre: 'Sala Rock', apellido: '', tipo: 'local' },
        ]),
      ),
      http.get(`${API}/eventos/4/`, () => HttpResponse.json(EVENTO)),
    );
  });

  it('carga los datos del evento y guarda los cambios con PUT', async () => {
    let enviado = null;
    server.use(
      http.put(`${API}/eventos/4/`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({ ...EVENTO, ...enviado });
      }),
    );
    const user = userEvent.setup();
    renderEditar();
    expect(await screen.findByRole('heading', { name: 'Editar evento' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/i)).toHaveValue('Concierto de otoño');
    expect(screen.getByLabelText(/^Fecha/i)).toHaveValue('2030-11-21');
    expect(screen.getByLabelText(/^Hora/i)).toHaveValue('20:30');
    expect(screen.getByLabelText(/Local de Ensamblia/i)).toHaveValue('7');
    expect(screen.getByLabelText('Rock')).toBeChecked();
    // El autor no se puede cambiar
    expect(screen.queryByLabelText(/Publicar como/i)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Título/i));
    await user.type(screen.getByLabelText(/Título/i), 'Concierto de invierno');
    await user.click(screen.getByLabelText('Jazz'));
    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/eventos/4'));
    expect(enviado).toMatchObject({
      titulo: 'Concierto de invierno', local_id: 7, lugar: '', generos: [1, 2], precio: 'Gratis',
      descripcion: 'Tres grupos',
    });
    expect(enviado.perfil_id).toBeUndefined();
    expect(new Date(enviado.fecha_inicio).getTime()).toBe(new Date(2030, 10, 21, 20, 30).getTime());
  });

  it('al quitar el local manda local_id null con la ciudad y el lugar', async () => {
    let enviado = null;
    server.use(
      http.put(`${API}/eventos/4/`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json(EVENTO);
      }),
    );
    const user = userEvent.setup();
    renderEditar();
    await user.selectOptions(await screen.findByLabelText(/Local de Ensamblia/i), '');
    expect(screen.getByLabelText(/^Ciudad/i)).toHaveValue('3');
    await user.type(screen.getByLabelText(/Lugar/i), 'Plaza Mayor');
    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => expect(enviado).not.toBeNull());
    expect(enviado).toMatchObject({ local_id: null, ciudad_id: 3, lugar: 'Plaza Mayor' });
  });

  it('quien no es el autor no puede editarlo', async () => {
    server.use(
      http.get(`${API}/eventos/mis-perfiles/`, () =>
        HttpResponse.json([{ perfil_id: 1, nombre: 'Ana', apellido: 'García', tipo: 'usuario' }]),
      ),
    );
    renderEditar();
    expect(await screen.findByText(/Solo quien publicó el evento puede editarlo/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar cambios/i })).not.toBeInTheDocument();
  });

  it('evento inexistente', async () => {
    server.use(http.get(`${API}/eventos/4/`, () => HttpResponse.json({ error: 'x' }, { status: 404 })));
    renderEditar();
    expect(await screen.findByText(/Este evento no existe/i)).toBeInTheDocument();
  });

  it('muestra el error del backend al guardar', async () => {
    server.use(
      http.put(`${API}/eventos/4/`, () =>
        HttpResponse.json({ titulo: ['El título es obligatorio'] }, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderEditar();
    await user.click(await screen.findByRole('button', { name: /Guardar cambios/i }));
    expect(await screen.findByText('El título es obligatorio')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
