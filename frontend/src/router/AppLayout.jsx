// src/router/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar';

/**
 * Layout para rutas privadas: perfil, chat, crear anuncio.
 * Monta el Navbar de app (con badge de no leídos) y renderiza la ruta hija.
 *
 * Requiere sesión: se monta dentro de <RequireAuth>.
 */
export function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}