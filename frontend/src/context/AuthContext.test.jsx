// src/context/AuthContext.test.jsx
import React, { useContext } from 'react';
import { describe, it, expect, beforeEach, vi} from 'vitest';
import api from '@/api/axios';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext, AuthProvider } from './AuthContext';

const TOKEN_KEY = 'ensamblia_token';
const USUARIO_KEY = 'ensamblia_usuario';

function Probe() {
  const { user, login, logout } = useContext(AuthContext);
  return (
    <div>
      <span data-testid="user">{user ? user.usuario : 'anon'}</span>
      <span data-testid="token">{user ? user.token : ''}</span>
      <button onClick={() => login('ana', 'tok.ana')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('arranca anónimo si no hay nada en localStorage', () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('user')).toHaveTextContent('anon');
  });

  it('hidrata desde localStorage al montar', () => {
    localStorage.setItem(TOKEN_KEY, 'tok.persistido');
    localStorage.setItem(USUARIO_KEY, 'luis');
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('user')).toHaveTextContent('luis');
    expect(screen.getByTestId('token')).toHaveTextContent('tok.persistido');
  });

  it('login guarda en estado y en localStorage', async () => {
    const user = userEvent.setup();
    render(<AuthProvider><Probe /></AuthProvider>);
    await user.click(screen.getByText('login'));
    expect(screen.getByTestId('user')).toHaveTextContent('ana');
    expect(screen.getByTestId('token')).toHaveTextContent('tok.ana');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok.ana');
    expect(localStorage.getItem(USUARIO_KEY)).toBe('ana');
  });

  it('logout limpia estado y localStorage', async () => {
    const user = userEvent.setup();
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    localStorage.setItem(USUARIO_KEY, 'ana');
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('user')).toHaveTextContent('ana');

    await user.click(screen.getByText('logout'));
    expect(screen.getByTestId('user')).toHaveTextContent('anon');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USUARIO_KEY)).toBeNull();
  });

  it('si falta el token pero hay usuario, arranca anónimo', () => {
    localStorage.setItem(USUARIO_KEY, 'ana');
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('user')).toHaveTextContent('anon');
  });

  it('si falta el usuario pero hay token, arranca anónimo', () => {
    localStorage.setItem(TOKEN_KEY, 'tok.x');
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('user')).toHaveTextContent('anon');
  });
});

// ── Tests del flag loading (Fase B.1) ──
describe('AuthContext — loading', () => {
  function LoadingProbe() {
    const { user, loading } = useContext(AuthContext);
    return (
      <div>
        <span data-testid="loading">{String(loading)}</span>
        <span data-testid="user">{user ? user.usuario : 'anon'}</span>
      </div>
    );
  }

  it('loading es false en el primer render si no hay sesión', () => {
    render(<AuthProvider><LoadingProbe /></AuthProvider>);
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('anon');
  });

  it('loading es false en el primer render si hay sesión', () => {
    localStorage.setItem('ensamblia_token', 'tok.x');
    localStorage.setItem('ensamblia_usuario', 'ana');
    render(<AuthProvider><LoadingProbe /></AuthProvider>);
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('ana');
  });
});

// ── Integración con el interceptor 401 (Fase B.2) ──
describe('AuthContext — evento auth:unauthorized', () => {
  function Probe2() {
    const { user } = useContext(AuthContext);
    return <span data-testid="user">{user ? user.usuario : 'anon'}</span>;
  }

  it('logout al recibir auth:unauthorized', async () => {
    localStorage.setItem('ensamblia_token', 'tok.x');
    localStorage.setItem('ensamblia_usuario', 'ana');

    render(<AuthProvider><Probe2 /></AuthProvider>);
    expect(screen.getByTestId('user')).toHaveTextContent('ana');

    await act(async () => {
      window.dispatchEvent(new Event('auth:unauthorized'));
    });

    expect(screen.getByTestId('user')).toHaveTextContent('anon');
    expect(localStorage.getItem('ensamblia_token')).toBeNull();
    expect(localStorage.getItem('ensamblia_usuario')).toBeNull();
  });
});

it('logout llama a /presence/offline/', async () => {
  localStorage.setItem('ensamblia_token', 'tok.x');
  localStorage.setItem('ensamblia_usuario', 'ana');

  // Espía de api.post
  const postSpy = vi.spyOn(api, 'post').mockResolvedValue({ data: {} });

  const user = userEvent.setup();
  render(<AuthProvider><Probe /></AuthProvider>);
  await user.click(screen.getByText('logout'));

  expect(postSpy).toHaveBeenCalledWith('/presence/offline/');
  expect(localStorage.getItem('ensamblia_token')).toBeNull();
});