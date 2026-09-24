import React, { useEffect, useState } from "react";
import {
    ArrowUpRight,
    Guitar,
    Heart,
    MapPin,
    MessageCircle,
    Music2,
    Plus,
    Search,
    Users,
    X,
} from "lucide-react";

import { useAsync } from "@/hooks/useAsync";
import { AsyncStateWrapper } from "@/components/ui/AsyncStateWrapper";
import { fetchAnuncios } from "@/services/anunciosService";

function SectionLabel({ children, tone = "yellow" }) {
    return (
        <div className={`section-label section-label--${tone}`}>
            {children}
        </div>
    );
}

export const TablonAnuncios = () => {
    const {
        execute,
        data: anuncios,
        status,
        error,
    } = useAsync(fetchAnuncios);

    const [busqueda, setBusqueda] = useState("");
    const [instrumentoSel, setInstrumentoSel] = useState("Todos");
    const [categoriaSel, setCategoriaSel] = useState("Todos");

    useEffect(() => {
        execute();
    }, [execute]);

    const anunciosFiltrados = (anuncios ?? []).filter((anuncio) => {
        const texto = busqueda.toLowerCase().trim();

        const coincideTexto =
            !texto ||
            anuncio.titulo?.toLowerCase().includes(texto) ||
            anuncio.descripcion?.toLowerCase().includes(texto) ||
            anuncio.ciudad?.toLowerCase().includes(texto) ||
            anuncio.instrumento?.toLowerCase().includes(texto) ||
            anuncio.categoria?.toLowerCase().includes(texto);

        const coincideInstrumento =
            instrumentoSel === "Todos" ||
            anuncio.instrumento === instrumentoSel;

        const coincideCategoria =
            categoriaSel === "Todos" ||
            anuncio.categoria === categoriaSel;

        return (
            coincideTexto &&
            coincideInstrumento &&
            coincideCategoria
        );
    });

    const filtrosActivos =
        busqueda.trim() !== "" ||
        instrumentoSel !== "Todos" ||
        categoriaSel !== "Todos";

    const limpiarFiltros = () => {
        setBusqueda("");
        setInstrumentoSel("Todos");
        setCategoriaSel("Todos");
    };

    return (
        <div className="ensamblia-site min-h-screen pb-16">
            {/* HEADER */}
            <section className="hero-section gap-5 border-b border-zinc-800/80 py-12">
                <div className="container">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div className="max-w-2xl space-y-3">
                            <SectionLabel tone="yellow">
                                MATCH & BÚSQUEDA
                            </SectionLabel>

                            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                                Tablón de Anuncios
                            </h1>

                            <p className="text-base text-zinc-400 sm:text-lg">
                                Encuentra integrantes para tu proyecto, únete
                                a bandas activas o conecta con músicos cerca
                                de ti.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="button button--yellow button--large flex items-center gap-2 self-start md:self-auto"
                        >
                            <Plus size={18} />
                            PUBLICAR ANUNCIO
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* BÚSQUEDA Y FILTROS */}
            <section className="border-b border-zinc-800/70 bg-zinc-950/70 py-8">
                <div className="container">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-yellow-400">
                                Explora oportunidades
                            </p>

                            <h2 className="text-xl font-bold text-white">
                                Encuentra tu próximo proyecto
                            </h2>
                        </div>

                        <span className="text-sm text-zinc-500">
                            {anunciosFiltrados.length}{" "}
                            {anunciosFiltrados.length === 1
                                ? "anuncio"
                                : "anuncios"}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-2xl shadow-black/10">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
                            {/* BUSCADOR */}
                            <label className="relative block">
                                <span className="sr-only">
                                    Buscar anuncios
                                </span>

                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                                />

                                <input
                                    type="search"
                                    value={busqueda}
                                    onChange={(event) =>
                                        setBusqueda(event.target.value)
                                    }
                                    placeholder="Instrumento, ciudad, estilo..."
                                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                                />

                                {busqueda && (
                                    <button
                                        type="button"
                                        aria-label="Limpiar búsqueda"
                                        onClick={() => setBusqueda("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </label>

                            {/* FILTRO INSTRUMENTO */}
                            <label>
                                <span className="sr-only">
                                    Filtrar por instrumento
                                </span>

                                <select
                                    value={instrumentoSel}
                                    onChange={(event) =>
                                        setInstrumentoSel(event.target.value)
                                    }
                                    className="h-12 w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                                >
                                    <option value="Todos">
                                        Todos los instrumentos
                                    </option>
                                    <option value="Guitarra Eléctrica">
                                        Guitarra eléctrica
                                    </option>
                                    <option value="Batería">Batería</option>
                                    <option value="Bajo">Bajo</option>
                                    <option value="Voz">Voz</option>
                                    <option value="Teclado / Piano">
                                        Teclado / piano
                                    </option>
                                    <option value="Saxofón">Saxofón</option>
                                </select>
                            </label>

                            {/* FILTRO CATEGORÍA */}
                            <label>
                                <span className="sr-only">
                                    Filtrar por categoría
                                </span>

                                <select
                                    value={categoriaSel}
                                    onChange={(event) =>
                                        setCategoriaSel(event.target.value)
                                    }
                                    className="h-12 w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                                >
                                    <option value="Todos">
                                        Todas las categorías
                                    </option>
                                    <option value="Busca Banda">
                                        Músico busca banda
                                    </option>
                                    <option value="Busca Músico">
                                        Banda busca músico
                                    </option>
                                    <option value="Proyecto Nuevo">
                                        Crear nuevo proyecto
                                    </option>
                                </select>
                            </label>

                            {/* LIMPIAR FILTROS */}
                            {filtrosActivos && (
                                <button
                                    type="button"
                                    onClick={limpiarFiltros}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-semibold text-zinc-300 transition hover:border-yellow-400 hover:text-yellow-400"
                                >
                                    <X size={16} />
                                    Limpiar
                                </button>
                            )}
                        </div>

                        {/* TENDENCIAS */}
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-3">
                            <span className="mr-1 text-xs font-semibold text-zinc-500">
                                Tendencias
                            </span>

                            {[
                                "Rock",
                                "Indie",
                                "Jazz",
                                "Madrid",
                                "Barcelona",
                                "Valencia",
                            ].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setBusqueda(tag)}
                                    className={`rounded-full border px-3 py-1.5 text-xs transition ${busqueda === tag
                                            ? "border-yellow-400 bg-yellow-400 text-zinc-950"
                                            : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-yellow-400/60 hover:text-white"
                                        }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* LISTADO DE ANUNCIOS */}
            <section className="section-pad">
                <div className="container">
                    <AsyncStateWrapper status={status} error={error}>
                        {anunciosFiltrados.length === 0 ? (
                            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-8 py-20 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-yellow-400">
                                    <Music2 size={24} />
                                </div>

                                <h3 className="mb-2 text-xl font-bold text-white">
                                    No encontramos anuncios con esos filtros
                                </h3>

                                <p className="mx-auto mb-6 max-w-md text-sm text-zinc-400">
                                    Prueba a limpiar la búsqueda o cambiar de
                                    ciudad para ver más músicos.
                                </p>

                                <button
                                    type="button"
                                    onClick={limpiarFiltros}
                                    className="button button--ghost text-sm"
                                >
                                    Restablecer filtros
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {anunciosFiltrados.map((anuncio) => {
                                    const isBanda =
                                        anuncio.categoria ===
                                        "Banda busca Músico";

                                    const cardColorClass = isBanda
                                        ? "feature-card--yellow"
                                        : "feature-card--purple";

                                    const badgeTone = isBanda
                                        ? "yellow"
                                        : "purple";

                                    return (
                                        <article
                                            key={anuncio.id}
                                            className={`feature-card ${cardColorClass} group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1`}
                                        >
                                            <div>
                                                {/* PARTE SUPERIOR */}
                                                <div className="feature-card-top mb-4">
                                                    <span className="feature-icon">
                                                        {isBanda ? (
                                                            <Users size={16} />
                                                        ) : (
                                                            <Guitar size={16} />
                                                        )}
                                                    </span>

                                                    <span className="feature-eyebrow">
                                                        {anuncio.categoria ||
                                                            "ANUNCIO"}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        aria-label="Añadir a favoritos"
                                                        className="ml-auto text-zinc-400 transition-colors hover:text-red-400"
                                                    >
                                                        <Heart size={16} />
                                                    </button>
                                                </div>

                                                {/* BADGES */}
                                                <div className="mb-3 flex flex-wrap gap-2">
                                                    {anuncio.instrumento && (
                                                        <SectionLabel
                                                            tone={badgeTone}
                                                        >
                                                            {
                                                                anuncio.instrumento
                                                            }
                                                        </SectionLabel>
                                                    )}

                                                    {anuncio.ciudad && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                                                            <MapPin
                                                                size={11}
                                                                className="text-yellow-400"
                                                            />
                                                            {anuncio.ciudad}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* TÍTULO */}
                                                <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-yellow-400">
                                                    {anuncio.titulo}
                                                </h3>

                                                {/* DESCRIPCIÓN */}
                                                <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-zinc-300">
                                                    {anuncio.descripcion}
                                                </p>
                                            </div>

                                            {/* FOOTER */}
                                            <div className="mt-auto flex items-center justify-between border-t border-zinc-800/80 pt-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${anuncio.avatarBg ||
                                                            "bg-yellow-400 text-zinc-950"
                                                            }`}
                                                    >
                                                        {anuncio.autorInitials ||
                                                            "EN"}
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold leading-none text-white">
                                                            {anuncio.autor ||
                                                                "Usuario Ensamblia"}
                                                        </span>

                                                        <small className="mt-0.5 text-[11px] text-zinc-500">
                                                            {anuncio.fecha ||
                                                                "Reciente"}
                                                        </small>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="button button--small button--yellow flex items-center gap-1 text-xs"
                                                >
                                                    <MessageCircle size={13} />
                                                    Hablar
                                                    <ArrowUpRight size={12} />
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

            {/* BANNER INFERIOR */}
            <section className="container mt-8">
                <div className="join-section relative overflow-hidden rounded-3xl p-8 text-center md:p-12">
                    <div className="join-spark join-spark--left">
                        ✦
                    </div>

                    <div className="join-spark join-spark--right">
                        ✦
                    </div>

                    <div className="flex flex-col items-center gap-5">
                        <SectionLabel tone="dark">
                            ¿NO ENCUENTRAS LO QUE BUSCAS?
                        </SectionLabel>

                        <h2 className="text-2xl font-extrabold text-zinc-950 sm:text-3xl">
                            Publica tu propio anuncio
                            <br />
                            <em className="font-normal italic">
                                y deja que el grupo te encuentre a ti.
                            </em>
                        </h2>

                        <button
                            type="button"
                            className="button button--dark button--large inline-flex items-center gap-2"
                        >
                            Crear mi Anuncio Gratis
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};