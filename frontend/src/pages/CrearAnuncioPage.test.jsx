// src/pages/CrearAnuncioPage.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { CrearAnuncioPage } from './CrearAnuncioPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/components/multimedia/EditarMediosModal', () => ({
  EditarMediosModal: ({ onSaved }) => (
    <div data-testid="modal">
      <button onClick={() => onSaved()}>Cerrar modal</button>
    </div>
  ),
}));

function renderCrear() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <CrearAnuncioPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('CrearAnuncioPage', () => {
  it('renderiza el formulario con título, tipo y contenido', async () => {
    renderCrear();
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de anuncio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contenido/i)).toBeInTheDocument();
  });

  it('crear anuncio abre el modal', async () => {
    const user = userEvent.setup();
    renderCrear();
    await user.type(
      screen.getByLabelText(/Título/i),
      'Busco batería para grupo',
    );
    await user.type(
      screen.getByLabelText(/Contenido/i),
      'Grupo de rock alternativo busca batería.',
    );
    await user.click(screen.getByRole('button', { name: /Publicar/i }));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  it('cerrar modal navega al detalle', async () => {
    const user = userEvent.setup();
    renderCrear();
    await user.type(
      screen.getByLabelText(/Título/i),
      'Busco batería para grupo',
    );
    await user.type(
      screen.getByLabelText(/Contenido/i),
      'Grupo de rock alternativo busca batería.',
    );
    await user.click(screen.getByRole('button', { name: /Publicar/i }));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Cerrar modal'));
    expect(navigateMock).toHaveBeenCalledWith('/anuncios/100');
  });

  it('con "¿Qué buscas?" rellenado guarda la búsqueda del anuncio creado', async () => {
    let enviado = null;
    server.use(
      http.put(`${API}/match/anuncios/:id/busqueda/`, async ({ request, params }) => {
        enviado = { id: params.id, body: await request.json() };
        return HttpResponse.json({});
      }),
    );
    const user = userEvent.setup();
    renderCrear();
    await user.type(screen.getByLabelText(/Título/i), 'Busco batería para grupo');
    await user.type(screen.getByLabelText(/Contenido/i), 'Grupo de rock alternativo busca batería.');
    await screen.findByRole('option', { name: 'Guitarra' });
    await user.selectOptions(screen.getByLabelText(/Qué tipo de perfil buscas/i), 'usuario');
    await user.selectOptions(screen.getByLabelText(/Instrumento que buscas/i), '1');
    await user.click(screen.getByLabelText('Rock'));
    await user.click(screen.getByRole('button', { name: /Publicar/i }));
    await waitFor(() => expect(enviado).not.toBeNull());
    expect(enviado.body).toEqual({ tipo_perfil: 'usuario', instrumento_id: 1, generos: [1] });
  });

  it('sin "¿Qué buscas?" no guarda ninguna búsqueda', async () => {
    let llamadas = 0;
    server.use(
      http.put(`${API}/match/anuncios/:id/busqueda/`, () => {
        llamadas += 1;
        return HttpResponse.json({});
      }),
    );
    const user = userEvent.setup();
    renderCrear();
    await user.type(screen.getByLabelText(/Título/i), 'Vendo amplificador');
    await user.type(screen.getByLabelText(/Contenido/i), 'Amplificador en buen estado, poco uso.');
    await user.click(screen.getByRole('button', { name: /Publicar/i }));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    expect(llamadas).toBe(0);
  });
});
