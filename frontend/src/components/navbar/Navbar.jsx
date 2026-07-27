import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/* ── Styles ── */
const nav = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 32px',
  height: '56px',
  borderBottom: '1px solid #EBEBEB',
  backgroundColor: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  position: 'sticky',
  top: 0,
  zIndex: 200,
};

const brand = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 800,
  fontSize: '17px',
  letterSpacing: '-0.04em',
  color: '#0F0F0F',
  textDecoration: 'none',
};

const dot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#FF5C35',
  flexShrink: 0,
};

const navLinks = {
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  listStyle: 'none',
};

const getLinkStyle = (isActive) => ({
  display: 'block',
  padding: '6px 14px',
  borderRadius: '6px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? '#0F0F0F' : '#8A8A8A',
  backgroundColor: isActive ? '#F2F2F2' : 'transparent',
  textDecoration: 'none',
  letterSpacing: '-0.01em',
  transition: 'background 140ms ease, color 140ms ease',
});

const ctaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const ctaBtnStyle = {
  padding: '7px 18px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  borderRadius: '6px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 140ms ease, transform 140ms ease',
  textDecoration: 'none',
};

const userNameStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#0F0F0F',
};

const btnLogoutStyle = {
  padding: '7px 16px',
  backgroundColor: 'transparent',
  color: '#8A8A8A',
  borderRadius: '6px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  border: '1px solid #EBEBEB',
  cursor: 'pointer',
  transition: 'border-color 140ms ease, color 140ms ease',
};

const LINKS = [
  { to: '/anuncios', label: 'Anuncios' },
  { to: '/perfil',   label: 'Mi perfil' },
  { to: '/chat',     label: 'Mensajes' },
];

export function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={nav}>
      {/* Brand */}
      <NavLink to="/" style={brand}>
        <span style={dot} />
        ensamblia
      </NavLink>

      {/* Links */}
      <ul style={navLinks}>
        {LINKS.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to} style={({ isActive }) => getLinkStyle(isActive)}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={ctaStyle}>
        {user ? (
          <>
            <span style={userNameStyle}>{user.usuario}</span>
            <button
              style={btnLogoutStyle}
              onClick={handleLogout}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D0D0D0'; e.currentTarget.style.color = '#2B2B2B'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EBEBEB'; e.currentTarget.style.color = '#8A8A8A'; }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            style={ctaBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E04820';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF5C35';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Iniciar sesión
          </NavLink>
        )}
      </div>
    </nav>
  );
}
