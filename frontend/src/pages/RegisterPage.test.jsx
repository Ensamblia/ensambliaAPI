// src/pages/RegisterPage.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RegisterPage } from './RegisterPage';

function renderRegister() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/perfil" element={<div>pantalla de perfil</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('RegisterPage', () => {
  it('renderiza el formulario', () => {
    renderRegister();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/contraseña/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('muestra error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/^usuario/i), 'nuevo');
    await user.type(screen.getByLabelText(/^contraseña/i), 'pass123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'otra');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  it('registro correcto guarda sesión y navega', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/^usuario/i), 'nuevo');
    await user.type(screen.getByLabelText(/^contraseña/i), 'pass123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'pass123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText('pantalla de perfil')).toBeInTheDocument();
    });
    expect(localStorage.getItem('ensamblia_usuario')).toBe('nuevo');
  });

  it('usuario duplicado muestra error', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/^usuario/i), 'ana');
    await user.type(screen.getByLabelText(/^contraseña/i), 'pass123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'pass123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/Ese usuario ya está en uso/i)).toBeInTheDocument();
    });
  });
});