import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { ArtistasSugeridos } from './ArtistasSugeridos';

function renderSugeridos(props = {}) {
  return render(
    <MemoryRouter>
      <ArtistasSugeridos perfilId={5} {...props} />
    </MemoryRouter>,
  );
}

describe('ArtistasSugeridos', () => {
  it('lista los artistas con enlace a su perfil y su afinidad', async () => {
    server.use(
      http.get(`${API}/locales/5/artistas-sugeridos/`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('limit')).toBe('10');
        return HttpResponse.json({
          count: 1,
          results: [
            { perfil_id: 9, nombre: 'Marta', apellido: 'Ruiz', tipo: 'usuario', misma_comarca: true, generos_comunes: 2 },
          ],
        });
      }),
    );
    renderSugeridos();
    const link = await screen.findByRole('link', { name: 'Marta Ruiz' });
    expect(link).toHaveAttribute('href', '/perfiles/9');
    expect(screen.getByText('En tu comarca · 2 estilos en común')).toBeInTheDocument();
  });

  it('sin resultados muestra un estado vacío', async () => {
    server.use(
      http.get(`${API}/locales/5/artistas-sugeridos/`, () =>
        HttpResponse.json({ count: 0, results: [] }),
      ),
    );
    renderSugeridos();
    expect(await screen.findByText(/Todavía no hay artistas disponibles/i)).toBeInTheDocument();
  });

  it('vuelve a pedir las sugerencias cuando cambia refreshKey', async () => {
    let llamadas = 0;
    server.use(
      http.get(`${API}/locales/5/artistas-sugeridos/`, () => {
        llamadas += 1;
        return HttpResponse.json({ count: 0, results: [] });
      }),
    );
    const { rerender } = renderSugeridos({ refreshKey: 0 });
    await waitFor(() => expect(llamadas).toBe(1));
    rerender(
      <MemoryRouter>
        <ArtistasSugeridos perfilId={5} refreshKey={1} />
      </MemoryRouter>,
    );
    await waitFor(() => expect(llamadas).toBe(2));
  });
});
