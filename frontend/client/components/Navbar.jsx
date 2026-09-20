import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronRight, Menu, X } from "lucide-react";

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <header className="site-header">
            <div className="container header-inner">
                {/* Logo que redirige a la Home */}
                <Link to="/" className="logo" aria-label="Volver al inicio">
                    <span className="logo-mark">✦</span>
                    ENSAMBLIA
                </Link>

                {/* Navegación Desktop */}
                <nav className="desktop-nav" aria-label="Navegación principal">
                    <Link to="/">Inicio</Link>
                    <Link to="/anuncios">Anuncios</Link>
                    <button onClick={() => handleNavigation("/#features")}>Funciones</button>
                    <button onClick={() => handleNavigation("/#community")}>Comunidad</button>
                </nav>

                {/* Acciones Header */}
                <div className="header-actions">
                    <button
                        className="button button--yellow button--small"
                        onClick={() => handleNavigation("/#join")}
                    >
                        ÚNETE GRATIS <ArrowUpRight size={14} />
                    </button>
                    <button
                        className="button button--outline button--small header-login"
                        onClick={() => handleNavigation("/#join")}
                    >
                        Acceso
                    </button>
                </div>

                {/* Botón Menú Hamburguesa (Móvil) */}
                <button
                    className="menu-toggle"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X size={23} /> : <Menu size={23} />}
                </button>
            </div>

            {/* Navegación Móvil */}
            {menuOpen && (
                <nav className="mobile-nav" aria-label="Navegación móvil">
                    <Link to="/" onClick={() => setMenuOpen(false)}>
                        Inicio <ChevronRight size={16} />
                    </Link>
                    <Link to="/anuncios" onClick={() => setMenuOpen(false)}>
                        Anuncios <ChevronRight size={16} />
                    </Link>
                    <button onClick={() => handleNavigation("/#features")}>
                        Funciones <ChevronRight size={16} />
                    </button>
                    <button onClick={() => handleNavigation("/#community")}>
                        Comunidad <ChevronRight size={16} />
                    </button>
                    <button
                        className="button button--yellow"
                        onClick={() => handleNavigation("/#join")}
                    >
                        ÚNETE GRATIS <ArrowUpRight size={15} />
                    </button>
                </nav>
            )}
        </header>
    );
}