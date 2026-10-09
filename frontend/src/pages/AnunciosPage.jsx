import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnuncioCard } from '../components/cards/AnuncioCard';
import { FiltrosAnuncios } from '../components/filters/FiltrosAnuncios';
import api, { extractList } from '../api/axios';

/* ── Layout ── */
const page = {
  maxWidth: '960px',
  margin: '0 auto',
  padding: '40px 24px 64px',
};

const pageHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '4px',
  flexWrap: 'wrap',
  gap: '12px',
};

const countBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  backgroundColor: '#F2F2F2',
  borderRadius: '999px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: '#8A8A8A',
  letterSpacing: '0.01em',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '14px',
};

/* ── States ── */
const stateBox = {
  padding: '56px 0',
  textAlign: 'center',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#8A8A8A',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
};

const stateIcon = { fontSize: '2rem', lineHeight: 1 };

const paginationBar = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  marginTop: '32px',
};

const pagBtn = {
  padding: '8px 18px',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  backgroundColor: 'transparent',
  color: '#2B2B2B',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'border-color 140ms ease, background 140ms ease',
};

const pagBtnDisabled = {
  ...pagBtn,
  color: '#D4D4D4',
  cursor: 'not-allowed',
};

const pagInfo = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
};

const PAGE_SIZE = 12;

export function AnunciosPage() {
  const [anuncios, setAnuncios] = useState([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros actuales (los guarda el componente FiltrosAnuncios)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo_anuncio: '',
    ordering: '-fecha_publicacion',
  });

  const debounceRef = useRef(null);

  // ── Cargar anuncios con filtros actuales ──
  const cargar = useCallback(async (filtrosActuales, nuevoOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: PAGE_SIZE,
        offset: nuevoOffset,
      };

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

      // DRF paginado: { count, results, next, previous }
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
      // Evitamos re-render si nada cambia
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
    const nuevoOffset = Math.max(0, offset - PAGE_SIZE);
    cargar(filtros, nuevoOffset);
  };

  const irSiguiente = () => {
    if (offset + PAGE_SIZE >= count) return;
    cargar(filtros, offset + PAGE_SIZE);
  };

  const hayAnterior = offset > 0;
  const haySiguiente = offset + PAGE_SIZE < count;
  const paginaActual = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPaginas = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <main style={page}>
      <div style={pageHeader}>
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            margin: 0,
            color: '#0F0F0F',
          }}
        >
          Anuncios
        </h1>
        {!loading && !error && (
          <span style={countBadge}>
            {count} resultado{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <FiltrosAnuncios onFilter={handleFilter} />

      {loading && (
        <div style={stateBox}>
          <span style={stateIcon}>⏳</span>
          <span>Cargando anuncios…</span>
        </div>
      )}

      {error && !loading && (
        <div style={{ ...stateBox, color: '#FF5C35' }}>
          <span style={stateIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && anuncios.length === 0 && (
        <div style={stateBox}>
          <span style={stateIcon}>🔍</span>
          <span>Sin resultados para tu búsqueda.</span>
        </div>
      )}

      {!loading && !error && anuncios.length > 0 && (
        <>
          <div style={grid}>
            {anuncios.map((anuncio) => (
              <AnuncioCard key={anuncio.anuncio_id} anuncio={anuncio} />
            ))}
          </div>

          {(hayAnterior || haySiguiente) && (
            <div style={paginationBar}>
              <button
                style={hayAnterior ? pagBtn : pagBtnDisabled}
                onClick={irAnterior}
                disabled={!hayAnterior}
                onMouseEnter={(e) => {
                  if (hayAnterior) e.currentTarget.style.borderColor = '#D0D0D0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EBEBEB';
                }}
              >
                ← Anterior
              </button>
              <span style={pagInfo}>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                style={haySiguiente ? pagBtn : pagBtnDisabled}
                onClick={irSiguiente}
                disabled={!haySiguiente}
                onMouseEnter={(e) => {
                  if (haySiguiente) e.currentTarget.style.borderColor = '#D0D0D0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EBEBEB';
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}