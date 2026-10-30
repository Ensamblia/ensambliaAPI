// src/components/navbar/Navbar.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('menú desplegable (pantallas estrechas)', () => {
    const abrir = () => userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    it('empieza cerrado y se abre con el botón', async () => {
      localStorage.setItem(TOKEN_KEY, 'tok.x');
      localStorage.setItem(USUARIO_KEY, 'ana');
      renderNav();
      const boton = screen.getByRole('button', { name: 'Abrir menú' });
      expect(boton).toHaveAttribute('aria-expanded', 'false');
      expect(document.getElementById('menu-movil')).toBeNull();

      await abrir();
      const menu = document.getElementById('menu-movil');
      expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
      for (const nombre of ['Anuncios', 'Locales', 'Eventos', 'Precios', 'Match', 'Mi perfil', 'Mensajes']) {
        expect(within(menu).getByRole('link', { name: nombre })).toBeInTheDocument();
      }
      expect(within(menu).getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
    });

    it('sin sesión solo muestra los enlaces públicos e Iniciar sesión', async () => {
      renderNav();
      await abrir();
      const menu = document.getElementById('menu-movil');
      expect(within(menu).getByRole('link', { name: 'Anuncios' })).toBeInTheDocument();
      expect(within(menu).queryByRole('link', { name: 'Mi perfil' })).not.toBeInTheDocument();
      expect(within(menu).getByRole('link', { name: /Iniciar sesión/i })).toBeInTheDocument();
    });

    it('se cierra al ir a otra página', async () => {
      localStorage.setItem(TOKEN_KEY, 'tok.x');
      localStorage.setItem(USUARIO_KEY, 'ana');
      renderNav({ route: '/anuncios' });
      await abrir();
      await userEvent.click(within(document.getElementById('menu-movil')).getByRole('link', { name: 'Eventos' }));
      expect(document.getElementById('menu-movil')).toBeNull();
      expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument();
    });

    it('se cierra con Escape', async () => {
      renderNav();
      await abrir();
      await userEvent.keyboard('{Escape}');
      expect(document.getElementById('menu-movil')).toBeNull();
    });

    it('con el menú abierto, Cerrar sesión cierra la sesión', async () => {
      localStorage.setItem(TOKEN_KEY, 'tok.x');
      localStorage.setItem(USUARIO_KEY, 'ana');
      renderNav();
      await abrir();
      await userEvent.click(within(document.getElementById('menu-movil')).getByRole('button', { name: 'Cerrar sesión' }));
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(document.getElementById('menu-movil')).toBeNull();
    });

    it('el contador de mensajes sin leer también sale dentro del menú', async () => {
      localStorage.setItem(TOKEN_KEY, 'tok.x');
      localStorage.setItem(USUARIO_KEY, 'ana');
      renderNav({ totalUnread: 4 });
      await abrir();
      const mensajes = within(document.getElementById('menu-movil')).getByRole('link', { name: /Mensajes/ });
      expect(within(mensajes).getByText('4')).toBeInTheDocument();
    });
  });
});
