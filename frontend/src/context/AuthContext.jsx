import React, { createContext, useState } from 'react';

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

  const login = (usuario, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, usuario);
    setUser({ usuario, token });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
