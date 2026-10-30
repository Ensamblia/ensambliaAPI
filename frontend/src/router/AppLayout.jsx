// src/router/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/shell/AppShell';

/**
 * Layout para rutas privadas: perfil, chat, crear anuncio.
 * Monta el AppShell (barra lateral + buscador) y renderiza la ruta hija.
 *
 * Requiere sesión: se monta dentro de <RequireAuth>.
 */
export function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
