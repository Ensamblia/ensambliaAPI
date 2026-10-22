// src/pages/PerfilPublicoPage.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { PerfilPublicoPage } from './PerfilPublicoPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderPerfil(id = 2) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/perfiles/${id}`]}>
        <Routes>
          <Route path="/perfiles/:id" element={<PerfilPublicoPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('PerfilPublicoPage', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    localStorage.clear();
  });

  it('carga y muestra nombre, descripción, instrumentos y géneros', async () => {
    renderPerfil(2);
    await waitFor(() => {
      expect(screen.getByText('Luis Flotu')).toBeInTheDocument();
    });
    expect(screen.getByText('Guitarrista')).toBeInTheDocument();
    expect(screen.getByText('Guitarra')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
  });

  it('muestra EmptyState si el perfil no existe', async () => {
    server.use(
      http.get(`${API}/perfiles/99999/`, () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );
    renderPerfil(99999);
    await waitFor(() => {
      expect(screen.getByText(/Este perfil no existe/i)).toBeInTheDocument();
    });
  });

  it('con sesión y no siendo mi perfil, muestra "Contactar"', async () => {
    localStorage.setItem('ensamblia_token', 'tok.x');
    localStorage.setItem('ensamblia_usuario', 'ana');
    server.use(
      http.get(`${API}/perfiles/me/`, () =>
        HttpResponse.json({
          perfil_id: 1,
          nombre: 'Ana',
          apellido: 'García',
          correo: 'ana@test.com',
          descripcion: 'Cantante',
          comarca_id: null,
          usuario_id: 1,
        }),
      ),
    );
    renderPerfil(2);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Contactar/i })).toBeInTheDocument();
    });
  });

  it('"Contactar" navega a /chat?chat=99', async () => {
    localStorage.setItem('ensamblia_token', 'tok.x');
    localStorage.setItem('ensamblia_usuario', 'ana');
    server.use(
      http.get(`${API}/perfiles/me/`, () =>
        HttpResponse.json({
          perfil_id: 1,
          nombre: 'Ana',
          apellido: 'García',
          correo: 'ana@test.com',
          descripcion: 'Cantante',
          comarca_id: null,
          usuario_id: 1,
        }),
      ),
    );
    const user = userEvent.setup();
    renderPerfil(2);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Contactar/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /Contactar/i }));
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/chat?chat=99');
    });
  });
});