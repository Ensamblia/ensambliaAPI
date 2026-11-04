// src/components/shell/AppShell.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Guitar,
  House,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Store,
  Tag as TagIcon,
  Users,
  X,
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { NotificationsContext } from '@/context/NotificationsContext';
import { PerfilContext } from '@/context/PerfilContext';
import { Avatar } from '@/components/ui';
import styles from './AppShell.module.css';

const PRINCIPAL = [
  { to: '/', label: 'Inicio', icon: House, tone: 'paper', end: true },
  { to: '/anuncios', label: 'Anuncios', icon: Megaphone, tone: 'yellow' },
  { to: '/mercado', label: 'Mercado', icon: Store, tone: 'blue' },
  { to: '/eventos', label: 'Eventos', icon: CalendarDays, tone: 'green' },
  { to: '/chat', label: 'Mensajes', icon: MessageCircle, tone: 'purple', withBadge: true },
  { to: '/locales', label: 'Locales', icon: Building2, tone: 'coral' },
];

const COMUNIDAD = [
  { to: '/match', label: 'Match', icon: Sparkles, tone: 'navy', pill: 'IA' },
  { to: '/musicos', label: 'Músicos', icon: Guitar, tone: 'paper' },
  { to: '/bandas', label: 'Bandas', icon: Users, tone: 'coral' },
  { to: '/precios', label: 'Planes', icon: TagIcon, tone: 'yellow' },
];

function NavItem({ to, label, icon: Icon, tone, end, withBadge, pill, unread }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => [styles.item, isActive ? styles.itemActive : ''].join(' ')}
    >
      <span className={[styles.itemIcon, styles[`tone_${tone}`]].join(' ')} aria-hidden="true">
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className={styles.itemLabel}>{label}</span>
      {withBadge && unread > 0 && <span className={styles.unread}>{unread}</span>}
      {pill && <span className={styles.pill}>{pill}</span>}
    </NavLink>
  );
}

/**
 * Esqueleto de la app con sesión iniciada: barra lateral fija con secciones
 * de colores + barra superior con buscador. En móvil la barra lateral se
 * convierte en un panel que se abre con el botón de menú.
 */
export function AppShell({ children }) {
  const { user, logout } = useContext(AuthContext);
  const { totalUnread } = useContext(NotificationsContext);
  const { me } = useContext(PerfilContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Al navegar, cerrar el panel móvil y volver arriba
  useEffect(() => {
    setAbierto(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const nombre = [me?.nombre, me?.apellido].filter(Boolean).join(' ') || user?.usuario || '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(q ? `/anuncios?q=${encodeURIComponent(q)}` : '/anuncios');
  };

  return (
    <div className={styles.shell}>
      <aside className={[styles.sidebar, abierto ? styles.sidebarOpen : ''].join(' ')}>
        <div className={styles.brandRow}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">✦</span>
            ENSAMBLIA
          </Link>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <Link to="/anuncios/crear" className={styles.publish}>
          <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
          Publicar anuncio
        </Link>

        <nav className={styles.nav} aria-label="Secciones">
          {PRINCIPAL.map((item) => (
            <NavItem key={item.to} {...item} unread={totalUnread} />
          ))}
          <p className={styles.groupLabel}>Comunidad</p>
          {COMUNIDAD.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className={styles.userCard}>
          <Link to="/perfil" className={styles.userRow}>
            <Avatar name={nombre} src={me?.foto_url} size="md" />
            <span className={styles.userText}>
              <strong>{nombre}</strong>
              <span>@{user?.usuario}</span>
            </span>
          </Link>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {abierto && (
        <button
          type="button"
          className={styles.scrim}
          onClick={() => setAbierto(false)}
          aria-label="Cerrar menú"
        />
      )}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setAbierto(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className={styles.topBrand}>
            <span className={styles.brandMark} aria-hidden="true">✦</span>
          </Link>
          <form className={styles.search} onSubmit={handleBuscar} role="search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca bajistas, baterías, jams…"
              aria-label="Buscar en anuncios"
            />
          </form>
          <Link to="/chat" className={styles.topIcon} aria-label="Mensajes">
            <MessageCircle size={19} />
            {totalUnread > 0 && <span className={styles.topDot}>{totalUnread}</span>}
          </Link>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
