import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

export function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usuario.trim() || !password) {
      setError('Rellena usuario y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { usuario, password });
      login(usuario, res.data.token);
      navigate('/perfil');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Usuario o contraseña incorrectos.');
      } else {
        setError('No se pudo conectar, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <span className="auth-tag">La red social para músicos</span>
        <h1>
          Conecta.<br />
          <span>Toca.</span><br />
          Crea.
        </h1>
        <p>Tu comunidad te está esperando.</p>
      </section>

      <section className="auth-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Acceso</h2>
          <p className="auth-sub">Vuelve a tu música y a tu gente.</p>

          <div className={`auth-field ${error ? 'has-error' : ''}`}>
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className={`auth-field ${error ? 'has-error' : ''}`}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="auth-msg">{error}</p>}
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="auth-switch">
            ¿Aún no tienes cuenta? <Link to="/register">Únete gratis</Link>
          </p>
        </form>
      </section>
    </main>
  );
}