import "../styles/landing.css";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { AuthContext } from "@/context/AuthContext";
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronRight,
    Guitar,
    Heart,
    MapPin,
    MessageCircle,
    Music2,
    Play,
    Search,
    Sparkles,
    Store,
    Users,
} from "lucide-react";

const featureCards = [
    {
        icon: Search,
        eyebrow: "MATCH REAL",
        title: "Encuentra tu gente",
        description:
            "Músicos, grupos y locales sugeridos por instrumento, estilo y comarca. Tu próxima banda está más cerca de lo que crees.",
        to: "/match",
        className: "feature-card--yellow",
        visual: "feature-visual--search",
    },
    {
        icon: Store,
        eyebrow: "SALAS Y LOCALES",
        title: "Encuentra dónde ensayar y tocar",
        description:
            "Locales de ensayo, salas y bares de tu comarca, ordenados por afinidad con tu música. Contacta directamente con ellos.",
        to: "/locales",
        className: "feature-card--blue",
        visual: "feature-visual--market",
    },
    {
        icon: CalendarDays,
        eyebrow: "EN TU CIUDAD",
        title: "Planifica tus próximos directos",
        to: "/eventos",
        description:
            "Descubre jams, conciertos y sesiones cerca de ti. Comparte tu evento y llena la sala de gente que escucha.",
        className: "feature-card--green",
        visual: "feature-visual--events",
    },
    {
        icon: MessageCircle,
        eyebrow: "SIN RUIDO",
        title: "Habla y crea",
        to: "/chat",
        description:
            "Mensajes directos para pasar de un ‘hola’ a un ensayo. Comparte referencias, fechas y ganas de hacer música.",
        className: "feature-card--purple",
        visual: "feature-visual--chat",
    },
    {
        icon: Users,
        eyebrow: "TU PROYECTO",
        title: "Dale espacio a tu banda",
        to: "/anuncios",
        description:
            "Crea un perfil de grupo, enseña tu sonido y encuentra a las personas que faltan para completar el escenario.",
        className: "feature-card--coral",
        visual: "feature-visual--group",
    },
];

// Por debajo de estas cifras no se enseñan: quedan peor que no poner nada.
const MIN_USUARIOS_VISIBLES = 50;
const MIN_ONLINE_VISIBLES = 5;

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
                    <div className="profile-row"><div className="mini-avatar mini-avatar--pink">M</div><div><b>Marina · Indie</b><small>Vallès Occidental · Rock</small></div><Heart size={14} /></div>
                    <div className="profile-row"><div className="mini-avatar mini-avatar--blue">A</div><div><b>Alex · Rock</b><small>Barcelonès · Indie</small></div><Heart size={14} /></div>
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
                <div className="price-tag">AFORO 250</div>
                <div className="market-sticker">SALA DE ENSAYO</div>
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
        <div className="phone-wrap" aria-hidden="true">
            <div className="phone-shadow" />
            <div className="phone">
                <div className="phone-notch" />
                <div className="phone-topline"><span>09:41</span><span>● ● ▰</span></div>
                <div className="phone-header"><span>ensamblia</span><Heart size={15} /></div>
                <div className="phone-greeting">Hola, <b>María</b><small>Tu próxima conexión está aquí.</small></div>
                <div className="phone-match-card"><div className="match-cover"><div className="cover-person" /><div className="cover-person cover-person--back" /></div><div className="match-meta"><span>92% COMPATIBILIDAD</span><b>Leo busca batería</b><small>Pop alternativo · 2 km</small></div><div className="match-actions"><span>✕</span><span className="is-liked"><Heart size={14} fill="currentColor" /></span></div></div>
                <div className="phone-section-title"><b>Eventos cerca de ti</b><span>Ver todos</span></div>
                <div className="phone-event"><div className="phone-event-date">24<br /><small>JUN</small></div><div><b>Sesión abierta</b><small>La Sala · 20:00</small></div><ChevronRight size={16} /></div>
                <div className="phone-nav"><span className="active"><Sparkles size={16} />Descubrir</span><span><MessageCircle size={16} />Mensajes</span><span><Users size={16} />Perfil</span></div>
            </div>
        </div>
    );
}

export function HomePage() {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        let cancelado = false;
        api.get("/stats/")
            .then((res) => {
                if (!cancelado) setStats(res.data);
            })
            .catch(() => {
                // Fallback silencioso
            });
        return () => {
            cancelado = true;
        };
    }, []);

    const colores = ["avatar--orange", "avatar--blue", "avatar--green"];
    const testimoniosReales = (stats?.testimonios || []).map((t, i) => ({
        quote: t.quote,
        name: t.nombre,
        role: t.rol,
        initials: (t.nombre || "")
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        color: colores[i % colores.length],
    }));
    const hayCifras = (stats?.usuarios_activos ?? 0) >= MIN_USUARIOS_VISIBLES;
    const hayOnline = (stats?.usuarios_online ?? 0) >= MIN_ONLINE_VISIBLES;
    const hayTestimonios = testimoniosReales.length > 0;

    return (
        <main className="ensamblia-site" id="top">
            <section className="hero-section">
                <div className="container hero-grid">
                    <div className="hero-copy">
                        <div className="eyebrow eyebrow--green"><span className="eyebrow-dot" /> LA NUEVA RED PARA MÚSICOS</div>
                        <h1>Conecta.<br /><em>Toca.</em><br />Crea.</h1>
                        <p>La red social donde los músicos encuentran su banda, comparten su pasión y hacen música juntos.</p>
                        <div className="hero-actions">{user ? <Link className="button button--dark" to="/perfil">Ir a mi perfil <ArrowUpRight size={17} /></Link> : <Link className="button button--dark" to="/register">Crear cuenta <ArrowUpRight size={17} /></Link>}<button className="button button--ghost" onClick={() => scrollToSection("how-it-works")}><Play size={15} fill="currentColor" /> Ver cómo funciona</button></div>
                        {hayCifras && <div className="hero-proof"><div className="avatar-stack"><span className="stack-avatar stack-avatar--one">L</span><span className="stack-avatar stack-avatar--two">M</span><span className="stack-avatar stack-avatar--three">J</span><span className="stack-avatar stack-avatar--four">+</span></div><span><b>{`+${stats?.usuarios_activos?.toLocaleString("es-ES")}`}</b> músicos ya están dentro</span></div>}
                    </div>
                    <div className="hero-art">
                        <div className="hero-image-wrap"><img src="https://images.pexels.com/photos/8198122/pexels-photo-8198122.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Dos músicos tocando juntos en un estudio" /><div className="hero-image-overlay" /><div className="hero-caption"><span className="caption-dot" /><span>Hacer música<br /><b>es encontrarse.</b></span></div></div>
                        <div className="hero-card hero-card--top"><Music2 size={17} /><span><b>Tu gente está aquí</b><small>Encuentra tu próximo match</small></span></div>
                        {hayOnline && <div className="hero-card hero-card--bottom"><span className="pulse-icon"><span /></span><span><b>Ahora mismo</b><small>{`${stats?.usuarios_online?.toLocaleString("es-ES")} músicos conectados`}</small></span></div>}
                        <div className="hero-scribble">✦</div>
                    </div>
                </div>
                <div className="hero-marquee"><div className="marquee-track"><span>ENCUENTRA TU BANDA</span><i>✦</i><span>COMPARTE TU SONIDO</span><i>✦</i><span>HAZ MÚSICA JUNTOS</span><i>✦</i><span>ENCUENTRA TU BANDA</span><i>✦</i><span>COMPARTE TU SONIDO</span><i>✦</i><span>HAZ MÚSICA JUNTOS</span></div></div>
            </section>

            <section className="features-section section-pad" id="features">
                <div className="container">
                    <div className="section-heading section-heading--center"><SectionLabel tone="yellow">TODO EN UN MISMO LUGAR</SectionLabel><h2>Tu música.<br /><span>Tu comunidad.</span></h2><p>Todo lo que necesitas para tu encuentro musical, reunido en un espacio que entiende cómo te sientes cuando suena una canción.</p></div>
                    <div className="feature-grid">{featureCards.map((feature) => { const Icon = feature.icon; return <Link to={feature.to} className={`feature-card ${feature.className}`} style={{ color: "inherit", textDecoration: "none" }} key={feature.title}><div className="feature-card-top"><span className="feature-icon"><Icon size={17} /></span><span className="feature-eyebrow">{feature.eyebrow}</span><ArrowUpRight className="feature-arrow" size={18} /></div><FeatureVisual type={feature.visual} /><div className="feature-copy"><h3>{feature.title}</h3><p>{feature.description}</p></div></Link>; })}</div>
                </div>
            </section>

            <section className="match-section section-pad" id="matching">
                <div className="container match-grid">
                    <div className="match-copy"><SectionLabel tone="dark">MATCHING INTELIGENTE</SectionLabel><h2>La química<br /><em>también suena.</em></h2><p>Ensamblia entiende tus referencias, tu forma de tocar y el tipo de proyecto que buscas para sugerirte conexiones que tienen sentido de verdad.</p><ul className="check-list"><li><span><Check size={13} /></span>Primero quien está en tu comarca y comparte tus estilos.</li><li><span><Check size={13} /></span>Sugerencias por instrumento, estilo y zona, con el motivo de cada una.</li><li><span><Check size={13} /></span>Conecta sin presión, a tu ritmo.</li></ul><Link className="button button--yellow" to="/match">Probar match inteligente <ArrowUpRight size={16} /></Link></div>
                    <div className="match-art"><div className="match-ring match-ring--outer" /><div className="match-ring match-ring--middle" /><div className="match-ring match-ring--inner" /><div className="match-center"><Sparkles size={23} /><span>92%</span><small>MATCH</small></div><div className="match-avatar match-avatar--one">M</div><div className="match-avatar match-avatar--two">A</div><div className="match-avatar match-avatar--three">J</div><div className="match-avatar match-avatar--four">L</div><div className="match-location match-location--one"><MapPin size={13} /> Barcelonès</div><div className="match-location match-location--two"><MapPin size={13} /> Vallès Occ.</div><div className="match-note">Tu sonido<br /><b>encaja aquí</b> <span>✦</span></div></div>
                </div>
            </section>

            <section className="process-section section-pad" id="how-it-works">
                <div className="container"><div className="section-heading section-heading--center"><SectionLabel tone="blue">SIN COMPLICACIONES</SectionLabel><h2>Empieza en <span>3 pasos.</span></h2><p>Olvídate de buscar en foros abandonados. Tu próximo proyecto musical empieza aquí.</p></div><div className="process-grid"><article className="process-card"><div className="step-number">01</div><div className="step-icon"><Music2 size={19} /></div><h3>Crea tu perfil</h3><p>Cuéntanos qué tocas, qué escuchas y qué tipo de sonido te gustaría encontrar.</p><ArrowDownRight className="step-arrow" size={22} /></article><article className="process-card process-card--offset"><div className="step-number">02</div><div className="step-icon"><Search size={19} /></div><h3>Explora y conecta</h3><p>Descubre músicos gracias al match. Envía un mensaje y empieza a colaborar.</p><ArrowDownRight className="step-arrow" size={22} /></article><article className="process-card"><div className="step-number">03</div><div className="step-icon"><Guitar size={19} /></div><h3>Haz música</h3><p>Reúnete, comparte proyectos y crea algo que solo podía pasar juntos.</p><span className="step-spark">✦</span></article></div></div>
            </section>

            <section className="download-section section-pad" id="download">
                <div className="container download-grid"><div className="download-copy"><SectionLabel tone="green">EN EL MÓVIL Y EN EL ORDENADOR</SectionLabel><h2>Lleva tu música<br /><em>contigo.</em></h2><p>Ensamblia funciona en el navegador de tu móvil, sin instalar nada. Tus músicos, tus chats y tu comunidad, estés donde estés.</p><div className="store-buttons"><Link className="button button--dark" to={user ? "/match" : "/register"}>{user ? "Ver mis matches" : "Crear cuenta gratis"} <ArrowUpRight size={16} /></Link></div></div><AppMockup /></div>
            </section>

            {hayTestimonios && <section className="community-section section-pad" id="community" aria-labelledby="community-title">
                <div className="container"><div className="section-heading section-heading--center"><SectionLabel tone="orange">VOCES DE LA COMUNIDAD</SectionLabel><h2 id="community-title">Una comunidad<br /><span>que crece.</span></h2><p>Músicos de todo tipo de géneros ya están encontrando su lugar, su gente y sus próximas canciones.</p></div><div className="testimonial-grid">{testimoniosReales.map((testimonial) => <article className="testimonial-card" key={`${testimonial.name}-${testimonial.quote}`}><div className="quote-mark">“</div><blockquote>{testimonial.quote}</blockquote><div className="testimonial-person"><div className={`testimonial-avatar ${testimonial.color}`}>{testimonial.initials}</div><span><b>{testimonial.name}</b><small>{testimonial.role}</small></span><Heart size={17} /></div></article>)}</div></div>
            </section>}

            {hayCifras && <section className="stats-section"><div className="container stats-grid"><div><strong>{`+${stats?.usuarios_activos?.toLocaleString("es-ES")}`}</strong><span>MÚSICOS ACTIVOS</span></div><div><strong>{`+${(stats?.grupos_formados ?? 0).toLocaleString("es-ES")}`}</strong><span>GRUPOS FORMADOS</span></div><div><strong>{`+${(stats?.anuncios_mes ?? 0).toLocaleString("es-ES")}`}</strong><span>ANUNCIOS AL MES</span></div><div><strong>{`+${(stats?.matches ?? 0).toLocaleString("es-ES")}`}</strong><span>MATCHES MUSICALES</span></div></div></section>}

            <section className="join-section" id="join"><div className="join-orbit join-orbit--one" /><div className="join-orbit join-orbit--two" /><div className="container join-inner"><div className="join-spark join-spark--left">✦</div><div className="join-spark join-spark--right">✦</div><SectionLabel tone="dark">TU PRÓXIMO PROYECTO EMPIEZA HOY</SectionLabel><h2>¿Listo para encontrar<br /><em>tu grupo?</em></h2><p>Únete a Ensamblia gratis y empieza a conectar con músicos que comparten tu pasión.</p>{user ? <Link className="button button--dark button--large" to="/match">Ver mis matches <ArrowUpRight size={18} /></Link> : <Link className="button button--dark button--large" to="/register">Crear mi cuenta <ArrowUpRight size={18} /></Link>}<small>Sin tarjeta. Sin ruido. Solo música.</small></div></section>

            <footer className="site-footer"><div className="container footer-top"><div className="footer-brand"><Logo /><p>La plataforma donde los músicos se encuentran, colaboran y crean juntos.</p></div><div className="footer-links"><div><b>Explorar</b><button onClick={() => scrollToSection("features")}>Funciones</button><button onClick={() => scrollToSection("how-it-works")}>Cómo funciona</button><Link to="/anuncios">Anuncios</Link><Link to="/locales">Locales</Link><Link to="/eventos">Eventos</Link></div><div><b>Ensamblia</b>{user ? <Link to="/perfil">Mi perfil</Link> : <><Link to="/register">Únete gratis</Link><Link to="/login">Acceso</Link></>}<Link to="/precios">Precios</Link></div></div></div><div className="container footer-bottom"><span>© 2026 Ensamblia. Todos los derechos reservados.</span><span>Hecho para quienes no pueden dejar de escuchar.</span></div></footer>
        </main>
    );
}

export default HomePage;