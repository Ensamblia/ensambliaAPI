// src/router/AppRouter.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { RequireAuth, PublicOnly } from './guards';

const TOKEN_KEY = 'ensamblia_token';
const USUARIO_KEY = 'ensamblia_usuario';

function setSession() {
  localStorage.setItem(TOKEN_KEY, 'tok.x');
  localStorage.setItem(USUARIO_KEY, 'ana');
}

function Private() {
  return <div>contenido privado</div>;
}
function Public() {
  return <div>contenido público</div>;
}
function LoginStub() {
  return <div>pantalla de login</div>;
}
function PerfilStub() {
  return <div>pantalla de perfil</div>;
}

describe('RequireAuth', () => {
  it('sin sesión redirige a /login', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/privado']}>
          <Routes>
            <Route
              path="/privado"
              element={
                <RequireAuth>
                  <Private />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginStub />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument();
  });

  it('con sesión renderiza el contenido', () => {
    setSession();
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/privado']}>
          <Routes>
            <Route
              path="/privado"
              element={
                <RequireAuth>
                  <Private />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginStub />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('contenido privado')).toBeInTheDocument();
    expect(screen.queryByText('pantalla de login')).not.toBeInTheDocument();
  });
});

describe('PublicOnly', () => {
  it('sin sesión renderiza el contenido', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <Public />
                </PublicOnly>
              }
            />
            <Route path="/perfil" element={<PerfilStub />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('contenido público')).toBeInTheDocument();
    expect(screen.queryByText('pantalla de perfil')).not.toBeInTheDocument();
  });

  it('con sesión redirige a /perfil', () => {
    setSession();
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <Public />
                </PublicOnly>
              }
            />
            <Route path="/perfil" element={<PerfilStub />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('pantalla de perfil')).toBeInTheDocument();
    expect(screen.queryByText('contenido público')).not.toBeInTheDocument();
  });
});

// ── Layouts (Fase C) ──

vi.mock('../components/navbar/LandingNavbar', () => ({
  LandingNavbar: () => <div data-testid="landing-navbar">landing navbar</div>,
}));
vi.mock('../components/navbar/Navbar', () => ({
  Navbar: () => <div data-testid="app-navbar">app navbar</div>,
}));

// Import dinámico para que los mocks apliquen antes de cargar los layouts.
const { PublicLayout } = await import('./PublicLayout');
const { AppLayout } = await import('./AppLayout');

describe('PublicLayout', () => {
  it('renderiza LandingNavbar + Outlet', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<div>home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByTestId('landing-navbar')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();
  });
});

describe('AppLayout', () => {
  it('renderiza Navbar + Outlet', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/perfil']}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/perfil" element={<div>perfil</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByTestId('app-navbar')).toBeInTheDocument();
    expect(screen.getByText('perfil')).toBeInTheDocument();
  });
});

// src/router/AppRouter.test.jsx (AÑADIR al final, después de lo existente)
import { AppRouter } from './AppRouter';

describe('AppRouter — smoke', () => {
  it('monta sin errores y renderiza el layout', () => {
    // AppRouter usa BrowserRouter, así que no necesita MemoryRouter.
    // Mockeamos los componentes pesados de la landing y las páginas para
    // no arrastrar lucide/CSS/landing.
    // (Los vi.mock ya están arriba en este archivo para LandingNavbar/Navbar.)
    const { container } = render(
      <AuthProvider>
        <AppRouter />
      </AuthProvider>,
    );
    // El layout tiene la clase del CSS module (hasheada). Comprobamos que existe un div raíz.
    expect(container.firstChild).toBeInTheDocument();
  });

  it('con sesión y página de origen vuelve a ella (p. ej. /match)', () => {
    setSession();
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/match' } }]}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <Public />
                </PublicOnly>
              }
            />
            <Route path="/match" element={<p>pantalla de match</p>} />
            <Route path="/perfil" element={<PerfilStub />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('pantalla de match')).toBeInTheDocument();
  });
});

describe('RequireAuth — recuerda a dónde ibas', () => {
  it('sin sesión manda al login con la ruta de origen en state.from', () => {
    localStorage.clear();
    let from = null;
    function LoginEspia() {
      from = useLocation().state?.from;
      return <p>pantalla de login</p>;
    }
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/match?busco=grupo']}>
          <Routes>
            <Route path="/match" element={<RequireAuth><Private /></RequireAuth>} />
            <Route path="/login" element={<LoginEspia />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(screen.getByText('pantalla de login')).toBeInTheDocument();
    expect(from).toBe('/match?busco=grupo');
  });
});

