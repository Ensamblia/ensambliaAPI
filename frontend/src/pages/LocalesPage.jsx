// src/pages/LocalesPage.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { buscarLocales } from '@/api/locales';
import { FiltrosLocales } from '@/components/locales/FiltrosLocales';
import { LocalCard } from '@/components/locales/LocalCard';
import { LocalCardSkeleton } from '@/components/locales/LocalCardSkeleton';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import { paramsDesdeFiltros } from '@/utils/tipoLocal';
import styles from './LocalesPage.module.css';

const PAGE_SIZE = 12;

export function LocalesPage() {
  const [locales, setLocales] = useState([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({});

  const debounceRef = useRef(null);
  // Solo la última petición puede actualizar la lista
  const ultimaPeticionRef = useRef(0);

  const cargar = useCallback(async (filtrosActuales, nuevoOffset = 0) => {
    const peticion = ++ultimaPeticionRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await buscarLocales({
        ...paramsDesdeFiltros(filtrosActuales),
        limit: PAGE_SIZE,
        offset: nuevoOffset,
      });
      if (peticion !== ultimaPeticionRef.current) return;
      setLocales(data.results ?? []);
      setCount(data.count ?? 0);
      setOffset(nuevoOffset);
    } catch (err) {
      if (peticion !== ultimaPeticionRef.current) return;
      setError(
        err.response?.status === 400
          ? 'Revisa los filtros: alguno no es válido.'
          : 'No se pudo conectar con el servidor.',
      );
    } finally {
      if (peticion === ultimaPeticionRef.current) setLoading(false);
    }
  }, []);

  // Al cambiar los filtros, volvemos a la primera página con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(filtros, 0), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filtros, cargar]);

  const handleFilter = useCallback((nuevos) => setFiltros(nuevos), []);

  const hayAnterior = offset > 0;
  const haySiguiente = offset + PAGE_SIZE < count;
  const paginaActual = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPaginas = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const hayFiltros = Object.values(filtros).some((v) => v !== '');
  const [resetKey, setResetKey] = useState(0);

  const quitarFiltros = () => setResetKey((k) => k + 1);

  return (
    <main className={styles.page}>
      <PageHeader
        title="Locales"
        actions={
          !loading && !error ? (
            <span className={styles.countBadge}>
              {count} resultado{count !== 1 ? 's' : ''}
            </span>
          ) : null
        }
      />

      <FiltrosLocales key={resetKey} onFilter={handleFilter} />

      {loading && (
        <div className={styles.grid} aria-busy="true" aria-label="Cargando locales">
          {Array.from({ length: 6 }, (_, i) => (
            <LocalCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState icon="⚠️" title="No se pudo cargar" description={error} />
      )}

          {!loading && !error && locales.length === 0 && (
  hayFiltros ? (
    <EmptyState
      icon="🏠"
      title="Ningún local con estos filtros"
      description="Prueba con otra comarca, otro estilo o quitando el aforo mínimo."
      action={
        <Button variant="secondary" onClick={quitarFiltros}>
          Quitar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon="🏠"
      title="Todavía no hay locales"
      description="Aún no se ha registrado ningún local. Vuelve pronto."
    />
  )
)}

      {!loading && !error && locales.length > 0 && (
        <>
          <div className={styles.grid}>
            {locales.map((l) => (
              <LocalCard key={l.perfil_id} local={l} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className={styles.paginationBar}>
              <Button
                variant="secondary"
                size="sm"
                disabled={!hayAnterior}
                onClick={() => cargar(filtros, Math.max(0, offset - PAGE_SIZE))}
              >
                Anterior
              </Button>
              <span className={styles.pageInfo}>
                {paginaActual} / {totalPaginas}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!haySiguiente}
                onClick={() => cargar(filtros, offset + PAGE_SIZE)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
