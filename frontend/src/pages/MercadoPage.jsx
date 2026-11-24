// src/pages/MercadoPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Plus, Search, Store } from 'lucide-react';
import { getTiposMercadoIds, listarMercado } from '@/api/mercado';
import { Button, Chip, EmptyState, PageHeader, Select, Spinner, Tag } from '@/components/ui';
import styles from './MercadoPage.module.css';

const PAGE_SIZE = 12;

const ORDENES = {
  recientes: '-fecha_publicacion',
  antiguos: 'fecha_publicacion',
  titulo: 'titulo',
};

export function MercadoPage() {
  const [todos, setTodos] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [guardados, setGuardados] = useState(() => new Set());
  const [soloGuardados, setSoloGuardados] = useState(false);
  const [tiposMercadoIds, setTiposMercadoIds] = useState(null); // null = cargando, [] = sin tipos
  const debounceRef = useRef(null);

  // 1. Cargar IDs de tipos de compra/venta
  useEffect(() => {
    let cancelado = false;
    getTiposMercadoIds().then((ids) => {
      if (!cancelado) setTiposMercadoIds(ids);
    });
    return () => { cancelado = true; };
  }, []);

  // 2. Cargar artículos
  const cargar = useCallback(async () => {
    if (tiposMercadoIds === null) return; // esperando tipos
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 200, ordering: ORDENES[orden] };
      if (busqueda.trim()) params.search = busqueda.trim();
      const data = await listarMercado(params);
      const lista = data.results ?? data ?? [];
      // Filtro ESTRICTO: solo anuncios cuyo tipo esté en tiposMercadoIds
      setTodos(lista.filter((a) => tiposMercadoIds.includes(a.tipo_anuncio_id)));
      setOffset(0);
    } catch {
      setError('No se pudo cargar el mercado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [tiposMercadoIds, busqueda, orden]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(cargar, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [cargar]);

  const alternarGuardado = (id) => {
    setGuardados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const base = useMemo(
    () => (soloGuardados ? todos.filter((a) => guardados.has(a.anuncio_id)) : todos),
    [todos, soloGuardados, guardados],
  );
  const count = base.length;
  const visibles = useMemo(() => base.slice(offset, offset + PAGE_SIZE), [base, offset]);
  const hayAnterior = offset > 0;
  const haySiguiente = offset + PAGE_SIZE < count;
  const paginaActual = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPaginas = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const sinTiposMercado = tiposMercadoIds !== null && tiposMercadoIds.length === 0;

  return (
    <main className={styles.page}>
      <PageHeader
        title="Mercado"
        icon={<Store size={22} />}
        tone="blue"
        subtitle="Compra y vende instrumentos y equipo entre músicos, con recogida en mano."
        actions={
          <Button to="/anuncios/crear" variant="primary" leftIcon={<Plus size={16} strokeWidth={2.5} />}>
            Vender algo
          </Button>
        }
      />

      <section className={styles.filtros}>
        <div className={styles.filtrosFila}>
          <label className={styles.buscador}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca guitarras, amplis, pedales…"
              aria-label="Buscar en el mercado"
            />
          </label>
          <div className={styles.orden}>
            <Select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="titulo">Título A→Z</option>
            </Select>
          </div>
        </div>
        <div className={styles.chips}>
          <Chip active={!soloGuardados} onClick={() => setSoloGuardados(false)}>Todo</Chip>
          <span className={styles.sep} aria-hidden="true" />
          <Chip active={soloGuardados} activeTone="yellow" onClick={() => setSoloGuardados((v) => !v)}>
            <Heart size={14} aria-hidden="true" /> Guardados
          </Chip>
        </div>
      </section>

      {sinTiposMercado && (
        <EmptyState
          icon="🛒"
          title="El mercado aún no está configurado"
          description="No hay tipos de anuncio de compra/venta en la base de datos. Ejecuta el seed para crearlos."
        />
      )}

      {!sinTiposMercado && loading && (
        <div className={styles.stateBox}>
          <Spinner size="lg" aria-label="Cargando mercado" />
        </div>
      )}

      {!sinTiposMercado && !loading && error && (
        <EmptyState icon="⚠️" title="No se pudo cargar" description={error} />
      )}

      {!sinTiposMercado && !loading && !error && visibles.length === 0 && (
        <EmptyState
          icon="🎛️"
          title="Nada por aquí"
          description="Prueba otra búsqueda o publica tu propio anuncio de compra/venta."
          action={<Button to="/anuncios/crear" variant="primary" size="sm">Publicar anuncio</Button>}
        />
      )}

      {!sinTiposMercado && !loading && !error && visibles.length > 0 && (
        <>
          <div className={styles.grid}>
            {visibles.map((a) => {
              const guardado = guardados.has(a.anuncio_id);
              const primeraImagen = (a.multimedias || []).find(
                (m) => (m.tipo_mime || '').startsWith('image/'),
              );
              return (
                <article key={a.anuncio_id} className={styles.card}>
                  <div className={[styles.media, styles.blue].join(' ')}>
                    {primeraImagen ? (
                      <img src={primeraImagen.archivo_url} alt={a.titulo} className={styles.mediaImg} />
                    ) : (
                      <Store size={52} strokeWidth={1.6} aria-hidden="true" />
                    )}
                    <button
                      type="button"
                      className={[styles.fav, guardado ? styles.favOn : ''].join(' ')}
                      onClick={() => alternarGuardado(a.anuncio_id)}
                      aria-pressed={guardado}
                      aria-label={guardado ? 'Quitar de guardados' : 'Guardar'}
                    >
                      <Heart size={17} fill={guardado ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className={styles.body}>
                    <div className={styles.tags}>
                      <Tag size="sm" color="blue">Instrumento</Tag>
                    </div>
                    <Link to={`/anuncios/${a.anuncio_id}`} className={styles.titulo}>{a.titulo}</Link>
                    <p className={styles.meta}>
                      <MapPin size={14} aria-hidden="true" />
                      {new Date(a.fecha_publicacion).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPaginas > 1 && (
            <div className={styles.paginationBar}>
              <Button variant="secondary" size="sm" disabled={!hayAnterior}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>Anterior</Button>
              <span className={styles.pageInfo}>{paginaActual} / {totalPaginas}</span>
              <Button variant="secondary" size="sm" disabled={!haySiguiente}
                onClick={() => setOffset(offset + PAGE_SIZE)}>Siguiente</Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}