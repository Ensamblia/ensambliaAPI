// src/pages/AnunciosPage.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Megaphone, Plus } from 'lucide-react';
import { AnuncioCard } from '@/components/cards/AnuncioCard';
import { FiltrosAnuncios } from '@/components/filters/FiltrosAnuncios';
import { Button, EmptyState, PageHeader, Spinner } from '@/components/ui';
import api, { extractList } from '@/api/axios';
import styles from './AnunciosPage.module.css';

const PAGE_SIZE = 12;

export function AnunciosPage() {
  const [anuncios, setAnuncios] = useState([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ?q= llega desde el buscador de la barra superior
  const [searchParams] = useSearchParams();
  const busquedaInicial = searchParams.get('q') || '';

  // Filtros actuales (los guarda FiltrosAnuncios)
  const [filtros, setFiltros] = useState({
    busqueda: busquedaInicial,
    tipo_anuncio: '',
    ordering: '-fecha_publicacion',
  });

  const debounceRef = useRef(null);

  // ── Cargar anuncios con filtros actuales ──
  const cargar = useCallback(async (filtrosActuales, nuevoOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: PAGE_SIZE, offset: nuevoOffset };
      if (filtrosActuales.busqueda?.trim()) {
        params.search = filtrosActuales.busqueda.trim();
      }
      if (filtrosActuales.tipo_anuncio) {
        params.tipo_anuncio = filtrosActuales.tipo_anuncio;
      }
      if (filtrosActuales.ordering) {
        params.ordering = filtrosActuales.ordering;
      }

      const res = await api.get('/anuncios/', { params });
      const data = res.data;
      const lista = data?.results ?? extractList(res);
      const total = data?.count ?? lista.length;

      setAnuncios(lista);
      setCount(total);
      setOffset(nuevoOffset);
    } catch (err) {
      if (err.response?.status === 404) {
        setAnuncios([]);
        setCount(0);
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Al cambiar los filtros, reseteamos offset y recargamos con debounce ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      cargar(filtros, 0);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filtros, cargar]);

  const handleFilter = useCallback((nuevosFiltros) => {
    setFiltros((prev) => {
      if (
        prev.busqueda === nuevosFiltros.busqueda &&
        prev.tipo_anuncio === nuevosFiltros.tipo_anuncio &&
        prev.ordering === nuevosFiltros.ordering
      ) {
        return prev;
      }
      return { ...prev, ...nuevosFiltros };
    });
  }, []);

  const irAnterior = () => {
    if (offset <= 0) return;
    cargar(filtros, Math.max(0, offset - PAGE_SIZE));
  };

  const irSiguiente = () => {
    if (offset + PAGE_SIZE >= count) return;
    cargar(filtros, offset + PAGE_SIZE);
  };

  const hayAnterior = offset > 0;
  const haySiguiente = offset + PAGE_SIZE < count;
  const paginaActual = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPaginas = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const mostrarContador = !loading && !error;

  return (
    <main className={styles.page}>
      <PageHeader
        title="Anuncios"
        icon={<Megaphone size={22} />}
        tone="yellow"
        subtitle="Bandas que buscan músicos, músicos que buscan banda y todo lo que se cuece en tu zona."
        actions={
          <Button to="/anuncios/crear" variant="primary" leftIcon={<Plus size={16} strokeWidth={2.5} />}>
            Publicar anuncio
          </Button>
        }
      />

      <FiltrosAnuncios
        key={busquedaInicial}
        onFilter={handleFilter}
        initialValues={{ busqueda: busquedaInicial }}
      />

      {mostrarContador && (
        <p className={styles.contador}>
          {count} anuncio{count !== 1 ? 's' : ''}
        </p>
      )}

      {loading && (
        <div className={styles.stateBox}>
          <Spinner size="lg" aria-label="Cargando anuncios" />
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon="⚠️"
          title="No se pudo cargar"
          description={error}
        />
      )}

      {!loading && !error && anuncios.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Sin resultados"
          description="Prueba con otros filtros o publica tu propio anuncio."
        />
      )}

      {!loading && !error && anuncios.length > 0 && (
        <>
          <div className={styles.grid}>
            {anuncios.map((anuncio) => (
              <AnuncioCard key={anuncio.anuncio_id} anuncio={anuncio} />
            ))}
          </div>

          {(hayAnterior || haySiguiente) && (
            <div className={styles.paginationBar}>
              <Button
                variant="secondary"
                size="md"
                onClick={irAnterior}
                disabled={!hayAnterior}
              >
                ← Anterior
              </Button>
              <span className={styles.pagInfo}>
                Página {paginaActual} de {totalPaginas}
              </span>
              <Button
                variant="secondary"
                size="md"
                onClick={irSiguiente}
                disabled={!haySiguiente}
              >
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}