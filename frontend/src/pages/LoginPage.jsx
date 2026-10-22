// src/pages/LoginPage.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { parseApiError } from '@/api/axios';
import { AuthContext } from '@/context/AuthContext';
import { Button, Field, Input, PageHeader } from '@/components/ui';
import styles from './LoginPage.module.css';

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
        setError(parseApiError(err, 'No se pudo conectar, inténtalo de nuevo.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <PageHeader title="Iniciar sesión" />

      <form className={styles.form} onSubmit={handleSubmit}>
        <Field label="Usuario" required>
          <Input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
          />
        </Field>

        <Field label="Contraseña" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" variant="primary" size="md" block loading={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className={styles.footer}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </main>
  );
}