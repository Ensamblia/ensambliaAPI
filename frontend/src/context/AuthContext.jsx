import React, { createContext, useEffect, useState } from 'react';
import api from '@/api/axios';

export const AuthContext = createContext();

const TOKEN_KEY = 'ensamblia_token';
const USUARIO_KEY = 'ensamblia_usuario';

function readStoredUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  const usuario = localStorage.getItem(USUARIO_KEY);
  if (!token || !usuario) return null;
  return { usuario, token };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading] = useState(false);

  const login = (usuario, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, usuario);
    setUser({ usuario, token });
  };

  const logout = () => {
    // Marcar offline en el back (best-effort; si falla, no rompemos el logout).
    api.post('/presence/offline/').catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUser(null);
  };

  // El response interceptor de axios emite 'auth:unauthorized' cuando
  // una petición autenticada recibe 401 (token caducado). Aquí limpiamos
  // la sesión; RequireAuth se encargará de redirigir a /login.
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}