import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const page = {
  maxWidth: '400px',
  margin: '0 auto',
  padding: '72px 24px 80px',
};

const heading = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.5rem',
  fontWeight: 800,
  letterSpacing: '-0.04em',
  color: '#0F0F0F',
  marginBottom: '24px',
};

const formCard = {
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  padding: '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
};

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: '#2B2B2B',
  letterSpacing: '-0.01em',
};

const inputStyle = {
  padding: '9px 13px',
  border: '1px solid #EBEBEB',
  borderRadius: '7px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#0F0F0F',
  backgroundColor: '#FAFAFA',
  outline: 'none',
  transition: 'border-color 140ms ease, box-shadow 140ms ease, background 140ms ease',
  width: '100%',
  boxSizing: 'border-box',
};

const errorText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#E0402B',
  margin: 0,
};

const btnSubmit = {
  padding: '10px 22px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  borderRadius: '7px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '13.5px',
  letterSpacing: '-0.01em',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 140ms ease, transform 140ms ease',
};

const btnSubmitDisabled = {
  ...btnSubmit,
  backgroundColor: '#F2B3A2',
  cursor: 'not-allowed',
};

const footerText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  marginTop: '16px',
  textAlign: 'center',
};

const footerLink = {
  color: '#FF5C35',
  fontWeight: 600,
  textDecoration: 'none',
};

const addFocusStyles = (e) => {
  e.target.style.borderColor = '#FF5C35';
  e.target.style.boxShadow = '0 0 0 3px rgba(255,92,53,0.10)';
  e.target.style.backgroundColor = '#FFFFFF';
};
const removeFocusStyles = (e) => {
  e.target.style.borderColor = '#EBEBEB';
  e.target.style.boxShadow = 'none';
  e.target.style.backgroundColor = '#FAFAFA';
};

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
      } else {
        setError('No se pudo conectar, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={page}>
      <h1 style={heading}>Crear cuenta</h1>

      <form style={formCard} onSubmit={handleSubmit}>
        <div style={fieldGroup}>
          <label style={labelStyle} htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            style={inputStyle}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            onFocus={addFocusStyles}
            onBlur={removeFocusStyles}
            autoComplete="username"
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle} htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={addFocusStyles}
            onBlur={removeFocusStyles}
            autoComplete="new-password"
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle} htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            style={inputStyle}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={addFocusStyles}
            onBlur={removeFocusStyles}
            autoComplete="new-password"
          />
        </div>

        {error && <p style={errorText}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={loading ? btnSubmitDisabled : btnSubmit}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#E04820'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#FF5C35'; }}
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p style={footerText}>
        ¿Ya tienes cuenta? <Link to="/login" style={footerLink}>Inicia sesión</Link>
      </p>
    </main>
  );
}
