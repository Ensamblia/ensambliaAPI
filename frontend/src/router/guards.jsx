// src/router/guards.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Envuelve rutas que requieren sesión.
 * - Mientras `loading` sea true, no decide (no parpadea).
 * - Si no hay sesión, redirige a /login.
 */
export function RequireAuth({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Envuelve rutas públicas que NO tienen sentido con sesión iniciada
 * (/login, /register). Si hay sesión, redirige a /perfil.
 */
export function PublicOnly({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (user) return <Navigate to="/perfil" replace />;
  return children;
}