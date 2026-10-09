import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Menu, X } from 'lucide-react';

/**
 * Navegación de la landing y del resto de páginas de la aplicación.
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

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="Volver al inicio">
          <span className="logo-mark">✦</span>
          ENSAMBLIA
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <Link to="/">Inicio</Link>
          <Link to="/anuncios">Anuncios</Link>
          <button onClick={() => goToSection('features')}>Funciones</button>
          <button onClick={() => goToSection('community')}>Comunidad</button>
        </nav>

        <div className="header-actions">
          <button className="button button--yellow button--small" onClick={() => goTo('/register')}>
            ÚNETE GRATIS <ArrowUpRight size={14} />
          </button>
          <button
            className="button button--outline button--small header-login"
            onClick={() => goTo('/login')}
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
          <Link to="/anuncios" onClick={() => setMenuOpen(false)}>
            Anuncios <ChevronRight size={16} />
          </Link>
          <button onClick={() => goToSection('features')}>
            Funciones <ChevronRight size={16} />
          </button>
          <button onClick={() => goToSection('community')}>
            Comunidad <ChevronRight size={16} />
          </button>
          <button className="button button--yellow" onClick={() => goTo('/register')}>
            ÚNETE GRATIS <ArrowUpRight size={15} />
          </button>
          <button className="button button--outline" onClick={() => goTo('/login')}>
            Acceso
          </button>
        </nav>
      )}
    </header>
  );
}
