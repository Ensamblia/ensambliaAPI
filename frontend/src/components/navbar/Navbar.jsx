// src/components/navbar/Navbar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { NotificationsContext } from '@/context/NotificationsContext';
import { Avatar, Badge, Button } from '@/components/ui';
import { PerfilContext } from '@/context/PerfilContext';
import styles from './Navbar.module.css';

const LINKS = [
  { to: '/anuncios', label: 'Anuncios' },
  { to: '/locales', label: 'Locales' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/precios', label: 'Precios' },
  { to: '/match', label: 'Match', authOnly: true },
  { to: '/perfil', label: 'Mi perfil', authOnly: true },
  { to: '/chat', label: 'Mensajes', authOnly: true, withBadge: true },
];

export function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { totalUnread } = useContext(NotificationsContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { me } = useContext(PerfilContext);
  // Menú desplegable de pantallas estrechas (el CSS decide cuándo se ve el botón)
  const [menuOpen, setMenuOpen] = useState(false);

  // Se cierra al cambiar de página
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // …y con Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const links = LINKS.filter((link) => !link.authOnly || user);
  const hayNoLeidos = Boolean(user) && totalUnread > 0;

  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      <div className={styles.bar}>
        <NavLink to="/" className={styles.brand}>
          <span className={styles.brandDot} aria-hidden="true" />
          ensamblia
        </NavLink>

        <ul className={styles.links}>
          {links.map(({ to, label, withBadge }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ')
                }
              >
                {label}
                {withBadge && totalUnread > 0 && (
                  <Badge value={totalUnread} variant="danger" size="sm" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.cta}>
          {user ? (
            <>
              <Avatar name={user.usuario} src={me?.foto_url} size="sm"/>
              <span className={styles.userName}>{user.usuario}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Button to="/login" variant="primary" size="sm">
              Iniciar sesión
            </Button>
          )}
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
          {/* Con el menú cerrado, avisa de que hay mensajes sin leer */}
          {!menuOpen && hayNoLeidos && <span className={styles.toggleDot} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <div id="menu-movil" className={styles.mobileMenu}>
          {user && (
            <div className={styles.mobileUser}>
              <Avatar name={user.usuario} src={me?.foto_url} size="sm"/>
              <span className={styles.mobileUserName}>{user.usuario}</span>
            </div>
          )}

          <ul className={styles.mobileLinks}>
            {links.map(({ to, label, withBadge }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [styles.mobileLink, isActive ? styles.mobileLinkActive : ''].filter(Boolean).join(' ')
                  }
                >
                  <span className={styles.mobileLinkLabel}>
                    {label}
                    {withBadge && totalUnread > 0 && (
                      <Badge value={totalUnread} variant="danger" size="sm" />
                    )}
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </NavLink>
              </li>
            ))}
          </ul>

          {user ? (
            <Button variant="secondary" size="md" block onClick={handleLogout}>
              Cerrar sesión
            </Button>
          ) : (
            <Button to="/login" variant="primary" size="md" block>
              Iniciar sesión
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
