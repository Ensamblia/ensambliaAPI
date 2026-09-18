import React from 'react';
import { Link } from 'react-router-dom';

const page = {
  maxWidth: '960px',
  margin: '0 auto',
  padding: '96px 24px 120px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '20px',
};

const eyebrowStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 12px',
  border: '1px solid #EBEBEB',
  borderRadius: '999px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: '#8A8A8A',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const heading = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 'clamp(3rem, 10vw, 5rem)',
  fontWeight: 900,
  color: '#0F0F0F',
  letterSpacing: '-0.04em',
  lineHeight: 1,
  margin: 0,
};

const accentWord = {
  color: '#FF5C35',
};

const subtext = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '15px',
  color: '#8A8A8A',
  lineHeight: 1.7,
  maxWidth: '440px',
  margin: 0,
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '12px 24px',
  backgroundColor: '#0F0F0F',
  color: '#FFFFFF',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '14px',
  letterSpacing: '-0.01em',
  textDecoration: 'none',
  marginTop: '12px',
};

export function NotFoundPage() {
  return (
    <main style={page}>
      <span style={eyebrowStyle}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FF5C35' }} />
        Error 404
      </span>

      <h1 style={heading}>
        Página <span style={accentWord}>no encontrada</span>
      </h1>

      <p style={subtext}>
        La página que buscas no existe o se ha movido. Comprueba la dirección o vuelve al inicio.
      </p>

      <Link to="/" style={btnPrimary}>← Volver al inicio</Link>
    </main>
  );
}
