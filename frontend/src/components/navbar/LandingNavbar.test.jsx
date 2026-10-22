// src/components/navbar/LandingNavbar.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationsContext } from '../../context/NotificationsContext';
import { LandingNavbar } from './LandingNavbar';

const TOKEN_KEY = 'ensamblia_token';
const USUARIO_KEY = 'ensamblia_usuario';

function renderNav({ totalUnread = 0 } = {}) {
  return render(
    <AuthProvider>
      <NotificationsContext.Provider value={{ totalUnread }}>
        <MemoryRouter>
          <LandingNavbar />
        </MemoryRouter>
      </NotificationsContext.Provider>
    </AuthProvider>,
  );
}

describe('LandingNavbar — CTAs condicionados a user', () => {
  it('sin sesión muestra ÚNETE GRATIS y Acceso', () => {
    renderNav();
    expect(screen.getAllByText(/ÚNETE GRATIS/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Acceso/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Mi perfil/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cerrar sesión/i)).not.toBeInTheDocument();
  });

  it('con sesión muestra Mi perfil y Cerrar sesión', () => {
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    localStorage.setItem(USUARIO_KEY, 'ana');
    renderNav();
    expect(screen.getAllByText(/Mi perfil/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cerrar sesión/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/ÚNETE GRATIS/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Acceso$/i)).not.toBeInTheDocument();
  });

  it('logout limpia localStorage', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    localStorage.setItem(USUARIO_KEY, 'ana');
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText(/Cerrar sesión/i));
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USUARIO_KEY)).toBeNull();
  });

  it('muestra badge de no leídos si totalUnread > 0', () => {
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    localStorage.setItem(USUARIO_KEY, 'ana');
    renderNav({ totalUnread: 3 });
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});