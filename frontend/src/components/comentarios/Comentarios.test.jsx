// src/components/comentarios/Comentarios.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { Comentarios } from './Comentarios';

function renderComentarios({ conSesion = false } = {}) {
  if (conSesion) {
    localStorage.setItem('ensamblia_token', 'tok.x');
    localStorage.setItem('ensamblia_usuario', 'ana');
  }
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Comentarios anuncioId={1} />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Comentarios', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sin comentarios muestra EmptyState', async () => {
    renderComentarios();
    await waitFor(() => {
      expect(screen.getByText(/Todavía no hay comentarios/i)).toBeInTheDocument();
    });
  });

  it('sin sesión muestra "Inicia sesión para comentar"', async () => {
    renderComentarios();
    await waitFor(() => {
      expect(screen.getByText(/Inicia sesión/i)).toBeInTheDocument();
    });
  });

  it('con sesión muestra el formulario de comentar', async () => {
    renderComentarios({ conSesion: true });
    await waitFor(() => {
      expect(screen.getByLabelText(/Nuevo comentario/i)).toBeInTheDocument();
    });
  });

  it('crear comentario lo añade a la lista', async () => {
    const user = userEvent.setup();
    renderComentarios({ conSesion: true });
    await waitFor(() => {
      expect(screen.getByLabelText(/Nuevo comentario/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Nuevo comentario/i), 'Muy interesante');
    await user.click(screen.getByRole('button', { name: /Comentar/i }));

    await waitFor(() => {
      expect(screen.getByText('Muy interesante')).toBeInTheDocument();
    });
  });

  it('cargar comentarios existentes los renderiza', async () => {
    server.use(
      http.get(`${API}/comentarios/anuncio/`, () =>
        HttpResponse.json([
          {
            comentario_id: 1,
            contenido: 'Comentario de prueba',
            fecha_publicacion: '2026-10-01T10:00:00Z',
            esta_eliminado: false,
            anuncio_id: 1,
            perfil_id: 2,
          },
        ]),
      ),
    );

    renderComentarios();
    await waitFor(() => {
      expect(screen.getByText('Comentario de prueba')).toBeInTheDocument();
    });
  });
});