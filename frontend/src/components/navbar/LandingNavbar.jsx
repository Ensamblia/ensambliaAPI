// src/components/navbar/LandingNavbar.jsx
import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Menu, X } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { NotificationsContext } from '@/context/NotificationsContext';
import { Badge, Button } from '@/components/ui';

/**
 * Navegación de la landing y del resto de páginas públicas.
 * Mantiene el look del landing (landing.css) en logo/nav/menú,
 * y usa Button/Badge del design system para los CTAs.
 */
export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { totalUnread } = useContext(NotificationsContext);

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

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
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
          <Link to="/locales">Locales</Link>
          <Link to="/eventos">Eventos</Link>
          <Link to="/match">Match</Link>
          <Link to="/precios">Precios</Link>
          <button onClick={() => goToSection('features')}>Funciones</button>
          <button onClick={() => goToSection('community')}>Comunidad</button>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => goTo('/perfil')}
                leftIcon={<ArrowUpRight size={14} />}
              >
                Mi perfil
              </Button>
              {totalUnread > 0 && (
                <Badge value={totalUnread} variant="danger" size="sm" />
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => goTo('/register')}
                leftIcon={<ArrowUpRight size={14} />}
              >
                ÚNETE GRATIS
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goTo('/login')}
              >
                Acceso
              </Button>
            </>
          )}
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
          <Link to="/locales" onClick={() => setMenuOpen(false)}>
            Locales <ChevronRight size={16} />
          </Link>
          <Link to="/eventos" onClick={() => setMenuOpen(false)}>
            Eventos <ChevronRight size={16} />
          </Link>
          <Link to="/match" onClick={() => setMenuOpen(false)}>
            Match <ChevronRight size={16} />
          </Link>
          <Link to="/precios" onClick={() => setMenuOpen(false)}>
            Precios <ChevronRight size={16} />
          </Link>
          <button onClick={() => goToSection('features')}>
            Funciones <ChevronRight size={16} />
          </button>
          <button onClick={() => goToSection('community')}>
            Comunidad <ChevronRight size={16} />
          </button>

          {user ? (
            <>
              <Button
                variant="primary"
                size="md"
                block
                onClick={() => goTo('/perfil')}
                leftIcon={<ArrowUpRight size={15} />}
              >
                Mi perfil
              </Button>
              {totalUnread > 0 && (
                <Badge value={totalUnread} variant="danger" size="sm" />
              )}
              <Button
                variant="secondary"
                size="md"
                block
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="md"
                block
                onClick={() => goTo('/register')}
                leftIcon={<ArrowUpRight size={15} />}
              >
                ÚNETE GRATIS
              </Button>
              <Button
                variant="secondary"
                size="md"
                block
                onClick={() => goTo('/login')}
              >
                Acceso
              </Button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}