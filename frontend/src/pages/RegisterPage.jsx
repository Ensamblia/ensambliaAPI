import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

export function RegisterPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usuario.trim() || !password || !confirmPassword) {
      setError('Rellena todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', { usuario, password });
      login(res.data.usuario.usuario, res.data.token);
      navigate('/perfil');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Ese usuario ya está en uso.');
      } else if (err.response?.status === 400) {
        // Errores de validación de DRF
        const data = err.response.data;
        const primerError = Object.values(data || {})[0];
        const mensaje = Array.isArray(primerError) ? primerError[0] : primerError;
        setError(mensaje || 'Datos inválidos.');
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
        <p>Tu próxima banda está más cerca.</p>
      </section>

      <section className="auth-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Únete gratis</h2>
          <p className="auth-sub">Crea tu perfil y encuentra tu gente.</p>

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
              autoComplete="new-password"
            />
          </div>

          <div className={`auth-field ${error ? 'has-error' : ''}`}>
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {error && <p className="auth-msg">{error}</p>}
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <p className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/login">Accede</Link>
          </p>
        </form>
      </section>
    </main>
  );
}