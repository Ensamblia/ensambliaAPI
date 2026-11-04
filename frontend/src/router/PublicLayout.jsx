// src/router/PublicLayout.jsx
import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LandingNavbar } from '../components/navbar/LandingNavbar';
import { AppShell } from '../components/shell/AppShell';

/**
 * Layout para rutas públicas: landing, login, register, anuncios, perfiles públicos, 404.
 * Sin sesión monta el LandingNavbar; con sesión, el mismo AppShell que las
 * rutas privadas, para que la app se vea igual en todas las secciones.
 */
export function PublicLayout() {
  const { user } = useContext(AuthContext);

  if (user) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  return (
    <>
      <LandingNavbar />
      <Outlet />
    </>
  );
}
