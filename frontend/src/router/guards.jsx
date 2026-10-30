// src/router/guards.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Envuelve rutas que requieren sesión.
 * - Mientras `loading` sea true, no decide (no parpadea).
 * - Si no hay sesión, redirige a /login recordando a dónde iba (state.from).
 */
export function RequireAuth({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}

/**
 * Envuelve rutas públicas que NO tienen sentido con sesión iniciada
 * (/login, /register). Si hay sesión, redirige a la página de la que venía
 * (state.from, que pone RequireAuth) o a /perfil.
 */
export function PublicOnly({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null;
  if (user) return <Navigate to={location.state?.from || '/perfil'} replace />;
  return children;
}