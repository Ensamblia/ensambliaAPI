import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { DatosLocalForm } from './DatosLocalForm';

const CIUDADES = [
  { ciudad_id: 3, nombre: 'Getafe', comarca_id: 1 },
  { ciudad_id: 4, nombre: 'Talavera', comarca_id: 2 },
];

function mockLocal(local) {
  server.use(
    http.get(`${API}/ciudades/`, () => HttpResponse.json(CIUDADES)),
    http.get(`${API}/locales/5/`, () =>
      HttpResponse.json({ perfil_id: 5, nombre: 'Sala Rock', local }),
    ),
  );
}

describe('DatosLocalForm', () => {
  it('si el local aún no tiene datos avisa de que hay que completarlos', async () => {
    mockLocal(null);
    render(<DatosLocalForm perfilId={5} />);
    expect(
      await screen.findByText(/Completa los datos de tu local para aparecer en búsquedas/i),
    ).toBeInTheDocument();
  });

  it('envía ciudad, dirección, aforo y tipos al guardar', async () => {
    mockLocal(null);
    let enviado = null;
    server.use(
      http.put(`${API}/locales/5/`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({
          perfil_id: 5,
          local: { ciudad_id: 3, ciudad: 'Getafe', direccion: 'C/ Mayor 1', aforo: 120, tipos: ['ensayo', 'sala'] },
        });
      }),
    );
    const user = userEvent.setup();
    render(<DatosLocalForm perfilId={5} />);

    await screen.findByRole('option', { name: 'Getafe' });
    await user.selectOptions(screen.getByLabelText(/Ciudad/i), '3');
    await user.type(screen.getByLabelText(/Dirección/i), 'C/ Mayor 1');
    await user.type(screen.getByLabelText(/Aforo/i), '120');
    await user.click(screen.getByLabelText('Ensayo'));
    await user.click(screen.getByLabelText('Sala de conciertos'));
    await user.click(screen.getByRole('button', { name: /Guardar datos del local/i }));

    await waitFor(() => expect(enviado).not.toBeNull());
    expect(enviado).toEqual({
      ciudad_id: 3,
      direccion: 'C/ Mayor 1',
      aforo: 120,
      tipos: ['ensayo', 'sala'],
    });
    expect(await screen.findByText(/Datos del local guardados/i)).toBeInTheDocument();
    expect(screen.queryByText(/Completa los datos de tu local/i)).not.toBeInTheDocument();
  });

  it('aforo vacío se envía como null', async () => {
    mockLocal({ ciudad_id: 3, ciudad: 'Getafe', direccion: 'C/ Mayor 1', aforo: 200, tipos: ['bar'] });
    let enviado = null;
    server.use(
      http.put(`${API}/locales/5/`, async ({ request }) => {
        enviado = await request.json();
        return HttpResponse.json({ perfil_id: 5, local: { ...enviado, ciudad: 'Getafe' } });
      }),
    );
    const user = userEvent.setup();
    render(<DatosLocalForm perfilId={5} />);

    const aforo = await screen.findByDisplayValue('200');
    await user.clear(aforo);
    await user.click(screen.getByRole('button', { name: /Guardar datos del local/i }));

    await waitFor(() => expect(enviado).not.toBeNull());
    expect(enviado.aforo).toBeNull();
    expect(enviado.tipos).toEqual(['bar']);
  });

  it('muestra el error del backend si el guardado falla', async () => {
    mockLocal({ ciudad_id: 3, ciudad: 'Getafe', direccion: 'C/ Mayor 1', aforo: 200, tipos: ['bar'] });
    server.use(
      http.put(`${API}/locales/5/`, () =>
        HttpResponse.json({ tipos: ['Indica al menos un tipo de local'] }, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    render(<DatosLocalForm perfilId={5} />);

    await screen.findByDisplayValue('200');
    await user.click(screen.getByRole('button', { name: /Guardar datos del local/i }));
    expect(await screen.findByText(/Indica al menos un tipo de local/i)).toBeInTheDocument();
  });

  it('si falla la carga muestra un error y no el aviso de completar datos', async () => {
    server.use(
      http.get(`${API}/ciudades/`, () => HttpResponse.json(CIUDADES)),
      http.get(`${API}/locales/5/`, () => HttpResponse.json({ error: 'x' }, { status: 500 })),
    );
    render(<DatosLocalForm perfilId={5} />);
    expect(await screen.findByText(/No se pudieron cargar los datos del local/i)).toBeInTheDocument();
    expect(screen.queryByText(/Completa los datos de tu local/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar datos del local/i })).not.toBeInTheDocument();
  });
});
