import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { DatosLocalInfo } from './DatosLocalInfo';

describe('DatosLocalInfo', () => {
  it('muestra ciudad, dirección, aforo y tipos del local', async () => {
    server.use(
      http.get(`${API}/locales/7/`, () =>
        HttpResponse.json({
          perfil_id: 7,
          local: { ciudad_id: 3, ciudad: 'Getafe', direccion: 'C/ Mayor 1', aforo: 200, tipos: ['sala', 'bar'] },
        }),
      ),
    );
    render(<DatosLocalInfo perfilId={7} />);
    expect(await screen.findByText('Getafe')).toBeInTheDocument();
    expect(screen.getByText('C/ Mayor 1')).toBeInTheDocument();
    expect(screen.getByText('Aforo: 200 personas')).toBeInTheDocument();
    expect(screen.getByText('Sala de conciertos')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
  });

  it('sin aforo no muestra la línea de aforo', async () => {
    server.use(
      http.get(`${API}/locales/7/`, () =>
        HttpResponse.json({
          perfil_id: 7,
          local: { ciudad_id: 3, ciudad: 'Getafe', direccion: 'C/ Mayor 1', aforo: null, tipos: ['ensayo'] },
        }),
      ),
    );
    render(<DatosLocalInfo perfilId={7} />);
    expect(await screen.findByText('Ensayo')).toBeInTheDocument();
    expect(screen.queryByText(/Aforo/)).not.toBeInTheDocument();
  });

  it('si el local no tiene datos no pinta nada', async () => {
    server.use(
      http.get(`${API}/locales/7/`, () => HttpResponse.json({ perfil_id: 7, local: null })),
    );
    const { container } = render(<DatosLocalInfo perfilId={7} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container).toBeEmptyDOMElement();
  });
});
