import React, { useEffect, useState } from "react";
import {
    ArrowDownRight,
    ArrowUpRight,
    Check,
    ChevronRight,
    Filter,
    Guitar,
    Heart,
    MapPin,
    MessageCircle,
    Music2,
    Plus,
    Search,
    Sparkles,
    Users,
    X,
} from "lucide-react";

import { useAsync } from "@/hooks/useAsync";
import { AsyncStateWrapper } from "@/components/ui/AsyncStateWrapper";
import { fetchAnuncios } from "@/services/anunciosService";

function SectionLabel({ children, tone = "yellow" }) {
    return <div className={`section-label section-label--${tone}`}>{children}</div>;
}

export const TablonAnuncios = () => {
    const { execute, data: anuncios, status, error } = useAsync(fetchAnuncios);
    const [busqueda, setBusqueda] = useState("");
    const [instrumentoSel, setInstrumentoSel] = useState("Todos");
    const [categoriaSel, setCategoriaSel] = useState("Todos");

    useEffect(() => {
        execute();
    }, [execute]);

    // Filtrado de anuncios
    const anunciosFiltrados = anuncios?.filter((anuncio) => {
        const coincideTexto =
            anuncio.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            anuncio.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
            anuncio.ciudad?.toLowerCase().includes(busqueda.toLowerCase());

        const coincideInstrumento =
            instrumentoSel === "Todos" || anuncio.instrumento === instrumentoSel;

        const coincideCategoria =
            categoriaSel === "Todos" || anuncio.categoria === categoriaSel;

        return coincideTexto && coincideInstrumento && coincideCategoria;
    });

    return (
        <div className="ensamblia-site min-h-screen pb-16">
            {/* HEADER DE SECCIÓN / HERO */}
            



            <section className="hero-section py-12 border-b border-zinc-800/80">
                <div className="container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <SectionLabel tone="yellow">MATCH & BÚSQUEDA</SectionLabel>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                                Tablón de <br />
                                <em>Anuncios.</em>
                            </h1>
                            <p className="text-zinc-400 text-base sm:text-lg">
                                Encuentra integrantes para tu proyecto, únete a bandas activas o conecta con músicos cerca de ti.
                            </p>
                        </div>

                        <button className="button button--yellow button--large self-start md:self-auto flex items-center gap-2">
                            <Plus size={18} /> PUBLICAR ANUNCIO <ArrowUpRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <section className="py-8 bg-zinc-900/40 border-b border-zinc-800/50">
                <div className="container space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Input Buscador principal */}
                        <div className="md:col-span-6 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por instrumento, ciudad (ej. Madrid, Barna), estilo..."
                                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-colors text-sm"
                            />
                            {busqueda && (
                                <button
                                    onClick={() => setBusqueda("")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Filtro Instrumento */}
                        <div className="md:col-span-3">
                            <select
                                value={instrumentoSel}
                                onChange={(e) => setInstrumentoSel(e.target.value)}
                                className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 text-sm focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
                            >
                                <option value="Todos">Todos los Instrumentos</option>
                                <option value="Guitarra Eléctrica">Guitarra Eléctrica</option>
                                <option value="Batería">Batería</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Voz">Voz</option>
                                <option value="Teclado / Piano">Teclado / Piano</option>
                                <option value="Saxofón">Saxofón</option>
                            </select>
                        </div>

                        {/* Filtro Tipo de Búsqueda */}
                        <div className="md:col-span-3">
                            <select
                                value={categoriaSel}
                                onChange={(e) => setCategoriaSel(e.target.value)}
                                className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 text-sm focus:outline-none focus:border-yellow-400 transition-colors cursor-pointer"
                            >
                                <option value="Todos">Todas las Categorías</option>
                                <option value="Busca Banda">Músico busca Banda</option>
                                <option value="Busca Músico">Banda busca Músico</option>
                                <option value="Proyecto Nuevo">Crear Nuevo Proyecto</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags rápidos de filtro */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-xs text-zinc-500 font-medium mr-1 flex items-center gap-1">
                            <Filter size={12} /> Tendencias:
                        </span>
                        {["Rock", "Indie", "Jazz", "Madrid", "Barcelona", "Valencia"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setBusqueda(tag)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 transition-colors"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* LISTADO DE ANUNCIOS */}
            <section className="section-pad">
                <div className="container">
                    <AsyncStateWrapper status={status} error={error}>
                        {anunciosFiltrados?.length === 0 ? (
                            <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800/80 p-8">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-yellow-400">
                                    <Music2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No encontramos anuncios con esos filtros</h3>
                                <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
                                    Prueba a limpiar la búsqueda o cambiar de ciudad para ver más músicos.
                                </p>
                                <button
                                    onClick={() => {
                                        setBusqueda("");
                                        setInstrumentoSel("Todos");
                                        setCategoriaSel("Todos");
                                    }}
                                    className="button button--ghost text-sm"
                                >
                                    Restablecer filtros
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {anunciosFiltrados?.map((anuncio) => {
                                    // Mapeo dinámico de estilos de tarjetas según la categoría
                                    const isBanda = anuncio.categoria === "Banda busca Músico";
                                    const cardColorClass = isBanda ? "feature-card--yellow" : "feature-card--purple";
                                    const badgeTone = isBanda ? "yellow" : "purple";

                                    return (
                                        <article
                                            key={anuncio.id}
                                            className={`feature-card ${cardColorClass} flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1`}
                                        >
                                            <div>
                                                {/* Top Bar de la Card */}
                                                <div className="feature-card-top mb-4">
                                                    <span className="feature-icon">
                                                        {isBanda ? <Users size={16} /> : <Guitar size={16} />}
                                                    </span>
                                                    <span className="feature-eyebrow">{anuncio.categoria || "ANUNCIO"}</span>
                                                    <button className="text-zinc-400 hover:text-red-400 transition-colors ml-auto">
                                                        <Heart size={16} />
                                                    </button>
                                                </div>

                                                {/* Badges de Instrumento y Ciudad */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <SectionLabel tone={badgeTone}>{anuncio.instrumento}</SectionLabel>
                                                    {anuncio.ciudad && (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-medium">
                                                            <MapPin size={11} className="text-yellow-400" /> {anuncio.ciudad}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Título y Descripción */}
                                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                                    {anuncio.titulo}
                                                </h3>
                                                <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3 mb-6">
                                                    {anuncio.descripcion}
                                                </p>
                                            </div>

                                            {/* Footer de la Card con Creador y CTA */}
                                            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${anuncio.avatarBg || 'bg-yellow-400 text-zinc-950'}`}>
                                                        {anuncio.autorInitials || "EN"}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-white leading-none">
                                                            {anuncio.autor || "Usuario Ensamblia"}
                                                        </span>
                                                        <small className="text-[11px] text-zinc-500 mt-0.5">
                                                            {anuncio.fecha || "Reciente"}
                                                        </small>
                                                    </div>
                                                </div>

                                                <button className="button button--small button--yellow flex items-center gap-1 text-xs">
                                                    <MessageCircle size={13} /> Hablar <ArrowUpRight size={12} />
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </AsyncStateWrapper>
                </div>
            </section>

            {/* BANNER INFERIOR TIPO JOIN */}
            <section className="container mt-8">
                <div className="join-section rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="join-spark join-spark--left">✦</div>
                    <div className="join-spark join-spark--right">✦</div>
                    <SectionLabel tone="dark">¿NO ENCUENTRAS LO QUE BUSCAS?</SectionLabel>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-2 mb-4">
                        Publica tu propio anuncio <br />
                        <em className="font-normal italic">y deja que el grupo te encuentre a ti.</em>
                    </h2>
                    <button className="button button--dark button--large inline-flex items-center gap-2 mx-auto">
                        Crear mi Anuncio Gratis <ArrowUpRight size={16} />
                    </button>
                </div>
            </section>
        </div>
    );
};