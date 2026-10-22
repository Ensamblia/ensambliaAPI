// src/pages/RegisterPage.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { parseApiError } from '@/api/axios';
import { AuthContext } from '@/context/AuthContext';
import { Button, Field, Input, PageHeader } from '@/components/ui';
import styles from './RegisterPage.module.css';

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
        setError(parseApiError(err, 'Datos inválidos.'));
      } else {
        setError(parseApiError(err, 'No se pudo conectar, inténtalo de nuevo.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <PageHeader title="Crear cuenta" />

      <form className={styles.form} onSubmit={handleSubmit}>
        <Field label="Usuario" required>
          <Input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
          />
        </Field>

        <Field label="Contraseña" required hint="Mínimo 6 caracteres">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirmar contraseña" required>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" variant="primary" size="md" block loading={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>

      <p className={styles.footer}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </main>
  );
}