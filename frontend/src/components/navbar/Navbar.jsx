// src/components/navbar/Navbar.jsx
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { NotificationsContext } from '@/context/NotificationsContext';
import { Avatar, Badge, Button } from '@/components/ui';
import { PerfilContext } from '@/context/PerfilContext';
import styles from './Navbar.module.css';

const LINKS = [
  { to: '/anuncios', label: 'Anuncios' },
  { to: '/locales', label: 'Locales' },
  { to: '/usuarios', label: 'Usuarios', authOnly: true },
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
  const { me } = useContext(PerfilContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={styles.brand}>
        <span className={styles.brandDot} aria-hidden="true" />
        ensamblia
      </NavLink>

      <ul className={styles.links}>
        {LINKS.filter((link) => !link.authOnly || user).map(({ to, label, withBadge }) => (
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
    </nav>
  );
}