// src/components/navbar/Navbar.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationsContext } from '../../context/NotificationsContext';
import { Navbar } from './Navbar';

const TOKEN_KEY = 'ensamblia_token';
const USUARIO_KEY = 'ensamblia_usuario';

function renderNav({ totalUnread = 0, route = '/' } = {}) {
  return render(
    <AuthProvider>
      <NotificationsContext.Provider value={{ totalUnread }}>
        <MemoryRouter initialEntries={[route]}>
          <Navbar />
        </MemoryRouter>
      </NotificationsContext.Provider>
    </AuthProvider>,
  );
}

describe('Navbar', () => {
  it('sin sesión muestra solo "Iniciar sesión"', () => {
    renderNav();
    expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument();
    expect(screen.queryByText(/Mi perfil/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mensajes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cerrar sesión/i)).not.toBeInTheDocument();
  });

  it('con sesión muestra usuario, Mi perfil, Mensajes y Cerrar sesión', () => {
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    localStorage.setItem(USUARIO_KEY, 'ana');
    renderNav();
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText(/Mi perfil/i)).toBeInTheDocument();
    expect(screen.getByText(/Mensajes/i)).toBeInTheDocument();
    expect(screen.getByText(/Cerrar sesión/i)).toBeInTheDocument();
  });

  it('muestra badge con totalUnread', () => {
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    localStorage.setItem(USUARIO_KEY, 'ana');
    renderNav({ totalUnread: 3 });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('muestra 99+ si totalUnread > 99', () => {
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    localStorage.setItem(USUARIO_KEY, 'ana');
    renderNav({ totalUnread: 150 });
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('marca el link activo con aria-current', () => {
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    localStorage.setItem(USUARIO_KEY, 'ana');
    renderNav({ route: '/perfil' });
    const link = screen.getByRole('link', { name: /Mi perfil/i });
    expect(link).toHaveAttribute('aria-current', 'page');
  });
});