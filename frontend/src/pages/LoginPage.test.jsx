// src/pages/LoginPage.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LoginPage } from './LoginPage';

function renderLogin(entrada = '/login') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[entrada]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/perfil" element={<div>pantalla de perfil</div>} />
          <Route path="/match" element={<div>pantalla de match</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('LoginPage', () => {

    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  it('renderiza el formulario con usuario y contraseña', () => {
    renderLogin();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('muestra error si se envía vacío', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    expect(screen.getByText(/Rellena usuario y contraseña/i)).toBeInTheDocument();
  });

  it('login correcto guarda sesión y navega a /perfil', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/usuario/i), 'ana');
    await user.type(screen.getByLabelText(/contraseña/i), 'ana123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('pantalla de perfil')).toBeInTheDocument();
    });
    expect(localStorage.getItem('ensamblia_token')).toBe('fake.jwt.token.ana');
    expect(localStorage.getItem('ensamblia_usuario')).toBe('ana');
  });

  it('login incorrecto muestra error controlado', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/usuario/i), 'ana');
    await user.type(screen.getByLabelText(/contraseña/i), 'mal');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Usuario o contraseña incorrectos/i)).toBeInTheDocument();
    });
    expect(localStorage.getItem('ensamblia_token')).toBeNull();
  });

  it('si viene de una página privada lo explica y vuelve a ella tras entrar', async () => {
    const user = userEvent.setup();
    renderLogin({ pathname: '/login', state: { from: '/match' } });
    expect(screen.getByText(/Para usar esta sección necesitas una cuenta/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/usuario/i), 'ana');
    await user.type(screen.getByLabelText(/contraseña/i), 'ana123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText('pantalla de match')).toBeInTheDocument();
  });

  it('sin página de origen no muestra el aviso', () => {
    renderLogin();
    expect(screen.queryByText(/Para usar esta sección/i)).not.toBeInTheDocument();
  });
});
