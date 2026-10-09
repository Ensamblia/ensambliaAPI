import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Menu, X } from 'lucide-react';
import { SOLO_LANDING } from '../../config';

/**
 * Navbar de la landing (diseño de la rama mmesab).
 * Con SOLO_LANDING = true solo enlaza a secciones de la propia página.
 * Con SOLO_LANDING = false enlaza también a /anuncios, /register y /login.
 */
export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goToSection = (id) => {
    setMenuOpen(false);
    const scroll = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (pathname === '/') {
      scroll();
    } else {
      navigate('/');
      setTimeout(scroll, 80);
    }
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const onJoin = () => (SOLO_LANDING ? goToSection('join') : goTo('/register'));
  const onLogin = () => (SOLO_LANDING ? goToSection('join') : goTo('/login'));

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="Volver al inicio">
          <span className="logo-mark">✦</span>
          ENSAMBLIA
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <Link to="/">Inicio</Link>
          {!SOLO_LANDING && <Link to="/anuncios">Anuncios</Link>}
          <button onClick={() => goToSection('features')}>Funciones</button>
          <button onClick={() => goToSection('community')}>Comunidad</button>
        </nav>

        <div className="header-actions">
          <button className="button button--yellow button--small" onClick={onJoin}>
            ÚNETE GRATIS <ArrowUpRight size={14} />
          </button>
          <button
            className="button button--outline button--small header-login"
            onClick={onLogin}
          >
            Acceso
          </button>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Navegación móvil">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Inicio <ChevronRight size={16} />
          </Link>
          {!SOLO_LANDING && (
            <Link to="/anuncios" onClick={() => setMenuOpen(false)}>
              Anuncios <ChevronRight size={16} />
            </Link>
          )}
          <button onClick={() => goToSection('features')}>
            Funciones <ChevronRight size={16} />
          </button>
          <button onClick={() => goToSection('community')}>
            Comunidad <ChevronRight size={16} />
          </button>
          <button className="button button--yellow" onClick={onJoin}>
            ÚNETE GRATIS <ArrowUpRight size={15} />
          </button>
        </nav>
      )}
    </header>
  );
}
