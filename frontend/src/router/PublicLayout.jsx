// src/router/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { LandingNavbar } from '../components/navbar/LandingNavbar';

/**
 * Layout para rutas públicas: landing, login, register, anuncios, perfiles públicos, 404.
 * Monta el LandingNavbar y renderiza la ruta hija con <Outlet />.
 */
export function PublicLayout() {
  return (
    <>
      <LandingNavbar />
      <Outlet />
    </>
  );
}