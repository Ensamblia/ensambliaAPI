import React from 'react';
import { Link } from 'react-router-dom';

/* ── Layout ── */
const page = {
  maxWidth: '960px',
  margin: '0 auto',
  padding: '72px 24px 80px',
};

/* ── Hero ── */
const hero = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '20px',
  marginBottom: '72px',
  maxWidth: '640px',
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

const accentDot = {
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: '#FF5C35',
  animation: 'pulse 2s ease-in-out infinite',
};

const heading = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 'clamp(2rem, 5vw, 3rem)',
  fontWeight: 900,
  color: '#0F0F0F',
  letterSpacing: '-0.04em',
  lineHeight: 1.1,
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
  maxWidth: '500px',
  margin: 0,
};

const ctaRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
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
  transition: 'transform 160ms ease, background 160ms ease',
};

const btnSecondary = {
  ...btnPrimary,
  backgroundColor: 'transparent',
  color: '#0F0F0F',
  border: '1px solid #EBEBEB',
};

/* ── Features grid ── */
const sectionLabel = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  color: '#D4D4D4',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: '20px',
};

const featuresGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: '1px',
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#EBEBEB',
};

const featureCell = {
  backgroundColor: '#FFFFFF',
  padding: '28px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const featureIcon = {
  fontSize: '1.6rem',
  lineHeight: 1,
};

const featureTitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  fontWeight: 700,
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
  margin: 0,
};

const featureDesc = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  lineHeight: 1.55,
  margin: 0,
};

/* ── Stats bar ── */
const statsBar = {
  display: 'flex',
  gap: '40px',
  borderTop: '1px solid #EBEBEB',
  paddingTop: '32px',
  marginTop: '64px',
  flexWrap: 'wrap',
};

const statItem = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const statNumber = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.6rem',
  fontWeight: 800,
  color: '#0F0F0F',
  letterSpacing: '-0.04em',
};

const statLabel = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#8A8A8A',
  letterSpacing: '0.01em',
};

const FEATURES = [
  { icon: '🎸', title: 'Anuncios musicales', desc: 'Publica y encuentra ofertas de músicos, bandas e instrumentos.' },
  { icon: '💬', title: 'Chat entre músicos', desc: 'Conecta directamente con otros artistas sin intermediarios.' },
  { icon: '👤', title: 'Perfil de artista', desc: 'Muestra tus instrumentos, géneros y experiencia musical.' },
  { icon: '📍', title: 'Por localización', desc: 'Filtra músicos y servicios por ciudad o comarca.' },
];

export function HomePage() {
  return (
    <main style={page}>
      {/* Hero */}
      <section style={hero}>
        <span style={eyebrowStyle}>
          <span style={accentDot} />
          Plataforma para músicos
        </span>

        <h1 style={heading}>
          Tu música,<br />
          tus <span style={accentWord}>conexiones</span>
        </h1>

        <p style={subtext}>
          Ensamblia reúne a músicos, bandas y profesionales del sector en un solo espacio.
          Publica anuncios, encuentra colaboradores y gestiona tus proyectos.
        </p>

        <div style={ctaRow}>
          <Link
            to="/anuncios"
            style={btnPrimary}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#1A1A1A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#0F0F0F'; }}
          >
            Explorar anuncios →
          </Link>
          <Link
            to="/perfil"
            style={btnSecondary}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#D0D0D0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#EBEBEB'; }}
          >
            Crear mi perfil
          </Link>
        </div>
      </section>

      {/* Features */}
      <section>
        <p style={sectionLabel}>Todo lo que necesitas</p>
        <div style={featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} style={featureCell}>
              <span style={featureIcon}>{f.icon}</span>
              <p style={featureTitle}>{f.title}</p>
              <p style={featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div style={statsBar}>
        {[
          { n: '+500', l: 'músicos registrados' },
          { n: '+120', l: 'anuncios activos' },
          { n: '12',   l: 'géneros musicales' },
          { n: '+30',  l: 'ciudades' },
        ].map(({ n, l }) => (
          <div key={l} style={statItem}>
            <span style={statNumber}>{n}</span>
            <span style={statLabel}>{l}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
