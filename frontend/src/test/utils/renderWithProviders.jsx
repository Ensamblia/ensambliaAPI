// src/test/utils/renderWithProviders.jsx
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationsProvider } from '../../context/NotificationsContext';

const TOKEN_KEY = 'ensamblia_token';
const USUARIO_KEY = 'ensamblia_usuario';

/**
 * Renderiza `ui` con los providers de la app (Auth + opcionalmente Notifications)
 * dentro de un MemoryRouter.
 *
 * @param {React.ReactElement} ui
 * @param {Object} [options]
 * @param {string} [options.route='/']  - ruta inicial del MemoryRouter
 * @param {string} [options.token]      - si se pasa, se inyecta en localStorage antes de montar
 * @param {string} [options.usuario]    - idem; por defecto 'ana' si hay token
 * @param {boolean} [options.withNotifications=false] - montar NotificationsProvider (abre WS)
 * @returns {ReturnType<typeof render>}
 */
export function renderWithProviders(ui, options = {}) {
  const {
    route = '/',
    token,
    usuario,
    withNotifications = false,
  } = options;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, usuario ?? 'ana');
  }

  function Wrapper({ children }) {
    const content = withNotifications ? (
      <NotificationsProvider>{children}</NotificationsProvider>
    ) : (
      children
    );

    return (
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>{content}</AuthProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

export { TOKEN_KEY, USUARIO_KEY };