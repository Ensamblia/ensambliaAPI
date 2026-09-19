import { useState } from "react";
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronRight,
    Guitar,
    Heart,
    MapPin,
    Menu,
    MessageCircle,
    Music2,
    Play,
    Search,
    Sparkles,
    Store,
    Users,
    X,
} from "lucide-react";

const featureCards = [
    {
        icon: Search,
        eyebrow: "MATCH REAL",
        title: "Encuentra tu gente",
        description:
            "Filtra músicos por instrumento, género, nivel y ciudad. Tu próxima banda está más cerca de lo que crees.",
        className: "feature-card--yellow",
        visual: "feature-visual--search",
    },
    {
        icon: Store,
        eyebrow: "MARKETPLACE",
        title: "Compra entre músicos",
        description:
            "Instrumentos, pedales y equipo con historias. Compra y vende de forma sencilla dentro de la comunidad.",
        className: "feature-card--blue",
        visual: "feature-visual--market",
    },
    {
        icon: CalendarDays,
        eyebrow: "EN TU CIUDAD",
        title: "Planifica tus próximos directos",
        description:
            "Descubre jams, conciertos y sesiones cerca de ti. Comparte tu evento y llena la sala de gente que escucha.",
        className: "feature-card--green",
        visual: "feature-visual--events",
    },
    {
        icon: MessageCircle,
        eyebrow: "SIN RUIDO",
        title: "Habla y crea",
        description:
            "Mensajes directos para pasar de un ‘hola’ a un ensayo. Comparte referencias, fechas y ganas de hacer música.",
        className: "feature-card--purple",
        visual: "feature-visual--chat",
    },
    {
        icon: Users,
        eyebrow: "TU PROYECTO",
        title: "Dale espacio a tu banda",
        description:
            "Crea un perfil de grupo, enseña tu sonido y encuentra a las personas que faltan para completar el escenario.",
        className: "feature-card--coral",
        visual: "feature-visual--group",
    },
];

const testimonials = [
    {
        quote:
            "Buscaba bajista para mi banda hace meses y en Ensamblia lo encontré en menos de una semana. El match fue perfecto.",
        name: "Carlos R.",
        role: "Guitarrista · Madrid",
        initials: "CR",
        color: "avatar--orange",
    },
    {
        quote:
            "Vine a Madrid a trabajar y no conocía a nadie. Ahora tengo un grupo de jazz con el que toco cada semana.",
        name: "Laura M.",
        role: "Saxofonista · Madrid",
        initials: "LM",
        color: "avatar--blue",
    },
    {
        quote:
            "Compré un bajo de jazz increíble en el marketplace. Todo el proceso fue sencillo y muy humano.",
        name: "Javier P.",
        role: "Bajista · Barcelona",
        initials: "JP",
        color: "avatar--green",
    },
];

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function Logo() {
    return (
        <button className="logo" onClick={() => scrollToSection("top")} aria-label="Volver al inicio">
            <span className="logo-mark">✦</span>
            ENSAMBLIA
        </button>
    );
}

function SectionLabel({ children, tone = "yellow" }) {
    return <div className={`section-label section-label--${tone}`}>{children}</div>;
}

function FeatureVisual({ type }) {
    if (type === "feature-visual--search") {
        return (
            <div className="feature-visual feature-visual--search" aria-hidden="true">
                <div className="search-window">
                    <div className="window-top"><span /><span /><span /></div>
                    <div className="search-line"><Search size={14} /><span>Guitarristas cerca de ti</span></div>
                    <div className="profile-row"><div className="mini-avatar mini-avatar--pink">M</div><div><b>Marina · Indie</b><small>Valencia · 92% match</small></div><Heart size={14} /></div>
                    <div className="profile-row"><div className="mini-avatar mini-avatar--blue">A</div><div><b>Alex · Rock</b><small>Valencia · 88% match</small></div><Heart size={14} /></div>
                </div>
                <div className="floating-note floating-note--yellow"><Music2 size={17} /></div>
            </div>
        );
    }

    if (type === "feature-visual--market") {
        return (
            <div className="feature-visual feature-visual--market" aria-hidden="true">
                <div className="amp-stack"><div className="amp amp--top" /><div className="amp amp--bottom" /></div>
                <div className="vinyl"><div className="vinyl-label" /></div>
                <div className="price-tag">€ 240</div>
                <div className="market-sticker">BUEN ESTADO</div>
            </div>
        );
    }

    if (type === "feature-visual--events") {
        return (
            <div className="feature-visual feature-visual--events" aria-hidden="true">
                <div className="event-poster"><div className="poster-date">18<br /><small>OCT</small></div><b>JAM<br />SESSION</b><span>LA FÁBRICA · 21:00</span></div>
                <div className="event-pin event-pin--one"><MapPin size={15} fill="currentColor" /></div>
                <div className="event-pin event-pin--two"><MapPin size={15} fill="currentColor" /></div>
                <div className="map-line map-line--one" /><div className="map-line map-line--two" />
            </div>
        );
    }

    if (type === "feature-visual--chat") {
        return (
            <div className="feature-visual feature-visual--chat" aria-hidden="true">
                <div className="chat-bubble chat-bubble--left">¿Ensayamos el jueves?</div>
                <div className="chat-bubble chat-bubble--right">Sí. Llevo la pedalera ✦</div>
                <div className="chat-bubble chat-bubble--left chat-bubble--short">Qué ganas.</div>
                <div className="chat-spark">✦</div>
            </div>
        );
    }

    return (
        <div className="feature-visual feature-visual--group" aria-hidden="true">
            <div className="group-photo"><div className="group-person person--one" /><div className="group-person person--two" /><div className="group-person person--three" /><div className="group-person person--four" /></div>
            <div className="group-badge"><Users size={14} /> 4 músicos</div>
            <div className="group-star">✦</div>
        </div>
    );
}

function AppMockup() {
    return (
        <div className="phone-wrap" aria-label="Vista previa de la app Ensamblia">
            <div className="phone-shadow" />
            <div className="phone">
                <div className="phone-notch" />
                <div className="phone-topline"><span>09:41</span><span>● ● ▰</span></div>
                <div className="phone-header"><span>ensamblia</span><Heart size={15} /></div>
                <div className="phone-greeting">Hola, <b>María</b><small>Tu próxima conexión está aquí.</small></div>
                <div className="phone-match-card"><div className="match-cover"><div className="cover-person" /><div className="cover-person cover-person--back" /></div><div className="match-meta"><span>92% COMPATIBILIDAD</span><b>Leo busca batería</b><small>Pop alternativo · 2 km</small></div><div className="match-actions"><button><X size={14} /></button><button className="is-liked"><Heart size={14} fill="currentColor" /></button></div></div>
                <div className="phone-section-title"><b>Eventos cerca de ti</b><span>Ver todos</span></div>
                <div className="phone-event"><div className="phone-event-date">24<br /><small>JUN</small></div><div><b>Sesión abierta</b><small>La Sala · 20:00</small></div><ChevronRight size={16} /></div>
                <div className="phone-nav"><span className="active"><Sparkles size={16} />Descubrir</span><span><MessageCircle size={16} />Mensajes</span><span><Users size={16} />Perfil</span></div>
            </div>
        </div>
    );
}

export default function Index() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = (id) => {
        setMenuOpen(false);
        scrollToSection(id);
    };

    return (
        <main className="ensamblia-site" id="top">
            <header className="site-header">
                <div className="container header-inner">
                    <Logo />
                    <nav className="desktop-nav" aria-label="Navegación principal">
                        <button onClick={() => navigate("features")}>Funciones</button>
                        <button onClick={() => navigate("how-it-works")}>Cómo funciona</button>
                        <button onClick={() => navigate("community")}>Comunidad</button>
                        <button onClick={() => navigate("download")}>Descargar</button>
                    </nav>
                    <div className="header-actions">
                        <button className="button button--yellow button--small" onClick={() => navigate("join")}>ÚNETE GRATIS <ArrowUpRight size={14} /></button>
                        <button className="button button--outline button--small header-login" onClick={() => navigate("join")}>Acceso</button>
                    </div>
                    <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen}>
                        {menuOpen ? <X size={23} /> : <Menu size={23} />}
                    </button>
                </div>
                {menuOpen && <nav className="mobile-nav" aria-label="Navegación móvil"><button onClick={() => navigate("features")}>Funciones <ChevronRight size={16} /></button><button onClick={() => navigate("how-it-works")}>Cómo funciona <ChevronRight size={16} /></button><button onClick={() => navigate("community")}>Comunidad <ChevronRight size={16} /></button><button onClick={() => navigate("download")}>Descargar <ChevronRight size={16} /></button><button className="button button--yellow" onClick={() => navigate("join")}>ÚNETE GRATIS <ArrowUpRight size={15} /></button></nav>}
            </header>

            <section className="hero-section">
                <div className="container hero-grid">
                    <div className="hero-copy">
                        <div className="eyebrow eyebrow--green"><span className="eyebrow-dot" /> LA NUEVA RED PARA MÚSICOS</div>
                        <h1>Conecta.<br /><em>Toca.</em><br />Crea.</h1>
                        <p>La red social donde los músicos encuentran su banda, comparten su pasión y hacen música juntos.</p>
                        <div className="hero-actions"><button className="button button--dark" onClick={() => scrollToSection("join")}>Crear cuenta <ArrowUpRight size={17} /></button><button className="button button--ghost" onClick={() => scrollToSection("download")}><Play size={15} fill="currentColor" /> Ver cómo funciona</button></div>
                        <div className="hero-proof"><div className="avatar-stack"><span className="stack-avatar stack-avatar--one">L</span><span className="stack-avatar stack-avatar--two">M</span><span className="stack-avatar stack-avatar--three">J</span><span className="stack-avatar stack-avatar--four">+</span></div><span><b>+10.000</b> músicos ya están dentro</span></div>
                    </div>
                    <div className="hero-art">
                        <div className="hero-image-wrap"><img src="https://images.pexels.com/photos/8198122/pexels-photo-8198122.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Dos músicos tocando juntos en un estudio" /><div className="hero-image-overlay" /><div className="hero-caption"><span className="caption-dot" /><span>Hacer música<br /><b>es encontrarse.</b></span></div></div>
                        <div className="hero-card hero-card--top"><Music2 size={17} /><span><b>Tu gente está aquí</b><small>Encuentra tu próximo match</small></span></div>
                        <div className="hero-card hero-card--bottom"><span className="pulse-icon"><span /></span><span><b>Ahora mismo</b><small>2.431 músicos conectados</small></span></div>
                        <div className="hero-scribble">✦</div>
                    </div>
                </div>
                <div className="hero-marquee"><div className="marquee-track"><span>ENCUENTRA TU BANDA</span><i>✦</i><span>COMPARTE TU SONIDO</span><i>✦</i><span>HAZ MÚSICA JUNTOS</span><i>✦</i><span>ENCUENTRA TU BANDA</span><i>✦</i><span>COMPARTE TU SONIDO</span><i>✦</i><span>HAZ MÚSICA JUNTOS</span></div></div>
            </section>

            <section className="features-section section-pad" id="features">
                <div className="container">
                    <div className="section-heading section-heading--center"><SectionLabel tone="yellow">TODO EN UN MISMO LUGAR</SectionLabel><h2>Tu música.<br /><span>Tu comunidad.</span></h2><p>Todo lo que necesitas para tu encuentro musical, reunido en un espacio que entiende cómo te sientes cuando suena una canción.</p></div>
                    <div className="feature-grid">{featureCards.map((feature) => { const Icon = feature.icon; return <article className={`feature-card ${feature.className}`} key={feature.title}><div className="feature-card-top"><span className="feature-icon"><Icon size={17} /></span><span className="feature-eyebrow">{feature.eyebrow}</span><ArrowUpRight className="feature-arrow" size={18} /></div><FeatureVisual type={feature.visual} /><div className="feature-copy"><h3>{feature.title}</h3><p>{feature.description}</p></div></article>; })}</div>
                </div>
            </section>

            <section className="match-section section-pad" id="matching">
                <div className="container match-grid">
                    <div className="match-copy"><SectionLabel tone="dark">MATCHING INTELIGENTE</SectionLabel><h2>La química<br /><em>también suena.</em></h2><p>Ensamblia entiende tus referencias, tu forma de tocar y el tipo de proyecto que buscas para sugerirte conexiones que tienen sentido de verdad.</p><ul className="check-list"><li><span><Check size={13} /></span>Filtra por geolocalización y afinidad artística.</li><li><span><Check size={13} /></span>El algoritmo aprende de tus gustos y actividad.</li><li><span><Check size={13} /></span>Conecta sin presión, a tu ritmo.</li></ul><button className="button button--yellow" onClick={() => scrollToSection("join")}>Probar match inteligente <ArrowUpRight size={16} /></button></div>
                    <div className="match-art"><div className="match-ring match-ring--outer" /><div className="match-ring match-ring--middle" /><div className="match-ring match-ring--inner" /><div className="match-center"><Sparkles size={23} /><span>92%</span><small>MATCH</small></div><div className="match-avatar match-avatar--one">M</div><div className="match-avatar match-avatar--two">A</div><div className="match-avatar match-avatar--three">J</div><div className="match-avatar match-avatar--four">L</div><div className="match-location match-location--one"><MapPin size={13} /> Valencia</div><div className="match-location match-location--two"><MapPin size={13} /> Madrid</div><div className="match-note">Tu sonido<br /><b>encaja aquí</b> <span>✦</span></div></div>
                </div>
            </section>

            <section className="process-section section-pad" id="how-it-works">
                <div className="container"><div className="section-heading section-heading--center"><SectionLabel tone="blue">SIN COMPLICACIONES</SectionLabel><h2>Empieza en <span>3 pasos.</span></h2><p>Olvídate de buscar en foros abandonados. Tu próximo proyecto musical empieza aquí.</p></div><div className="process-grid"><article className="process-card"><div className="step-number">01</div><div className="step-icon"><Music2 size={19} /></div><h3>Crea tu perfil</h3><p>Cuéntanos qué tocas, qué escuchas y qué tipo de sonido te gustaría encontrar.</p><ArrowDownRight className="step-arrow" size={22} /></article><article className="process-card process-card--offset"><div className="step-number">02</div><div className="step-icon"><Search size={19} /></div><h3>Explora y conecta</h3><p>Descubre músicos gracias al match. Envía un mensaje y empieza a colaborar.</p><ArrowDownRight className="step-arrow" size={22} /></article><article className="process-card"><div className="step-number">03</div><div className="step-icon"><Guitar size={19} /></div><h3>Haz música</h3><p>Reúnete, comparte proyectos y crea algo que solo podía pasar juntos.</p><span className="step-spark">✦</span></article></div></div>
            </section>

            <section className="download-section section-pad" id="download">
                <div className="container download-grid"><div className="download-copy"><SectionLabel tone="green">EN TODOS TUS DISPOSITIVOS</SectionLabel><h2>Lleva tu música<br /><em>contigo.</em></h2><p>Disponible en web y app móvil. Mantente al día con tus músicos, tus chats y tu comunidad, estés donde estés.</p><div className="store-buttons"><button className="store-button" onClick={() => scrollToSection("join")}><span className="store-icon">●</span><span><small>Próximamente en</small><b>App Store</b></span><ArrowUpRight size={16} /></button><button className="store-button" onClick={() => scrollToSection("join")}><span className="store-icon store-icon--play"><Play size={13} fill="currentColor" /></span><span><small>Próximamente en</small><b>Google Play</b></span><ArrowUpRight size={16} /></button></div></div><AppMockup /></div>
            </section>

            <section className="community-section section-pad" id="community" aria-labelledby="community-title">
                <div className="container"><div className="section-heading section-heading--center"><SectionLabel tone="orange">VOCES DE LA COMUNIDAD</SectionLabel><h2 id="community-title">Una comunidad<br /><span>que crece.</span></h2><p>Músicos de todo tipo de géneros ya están encontrando su lugar, su gente y sus próximas canciones.</p></div><div className="testimonial-grid">{testimonials.map((testimonial) => <article className="testimonial-card" key={testimonial.name}><div className="quote-mark">“</div><blockquote>{testimonial.quote}</blockquote><div className="testimonial-person"><div className={`testimonial-avatar ${testimonial.color}`}>{testimonial.initials}</div><span><b>{testimonial.name}</b><small>{testimonial.role}</small></span><Heart size={17} /></div></article>)}</div></div>
            </section>

            <section className="stats-section"><div className="container stats-grid"><div><strong>+10.000</strong><span>MÚSICOS ACTIVOS</span></div><div><strong>+2.500</strong><span>GRUPOS FORMADOS</span></div><div><strong>+800</strong><span>EVENTOS AL MES</span></div><div><strong>+15.000</strong><span>MATCHES MUSICALES</span></div></div></section>

            <section className="join-section" id="join"><div className="join-orbit join-orbit--one" /><div className="join-orbit join-orbit--two" /><div className="container join-inner"><div className="join-spark join-spark--left">✦</div><div className="join-spark join-spark--right">✦</div><SectionLabel tone="dark">TU PRÓXIMO PROYECTO EMPIEZA HOY</SectionLabel><h2>¿Listo para encontrar<br /><em>tu grupo?</em></h2><p>Únete a Ensamblia gratis y empieza a conectar con músicos que comparten tu pasión.</p><button className="button button--dark button--large" onClick={() => scrollToSection("top")}>Crear mi cuenta <ArrowUpRight size={18} /></button><small>Sin tarjeta. Sin ruido. Solo música.</small></div></section>

            <footer className="site-footer"><div className="container footer-top"><div className="footer-brand"><Logo /><p>La plataforma donde los músicos se encuentran, colaboran y crean juntos.</p><div className="footer-socials"><button aria-label="Instagram">ig</button><button aria-label="TikTok">tk</button><button aria-label="YouTube">yt</button></div></div><div className="footer-links"><div><b>Explorar</b><button onClick={() => navigate("features")}>Funciones</button><button onClick={() => navigate("how-it-works")}>Cómo funciona</button><button onClick={() => navigate("community")}>Comunidad</button><button onClick={() => navigate("download")}>Descargar</button></div><div><b>Ensamblia</b><button onClick={() => navigate("join")}>Únete gratis</button><button onClick={() => navigate("join")}>Acceso</button><button onClick={() => navigate("join")}>Contacto</button><button onClick={() => navigate("join")}>Ayuda</button></div></div></div><div className="container footer-bottom"><span>© 2025 Ensamblia. Todos los derechos reservados.</span><span>Hecho para quienes no pueden dejar de escuchar.</span></div></footer>
        </main>
    );
}