import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { AnuncioCard } from '../components/cards/AnuncioCard';
import { FiltrosAnuncios } from '../components/filters/FiltrosAnuncios';

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

export function AnunciosPage() {
  const [anuncios, setAnuncios]   = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    api.get('/anuncios')
      .then((res) => {
        setAnuncios(res.data);
        setFiltrados(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setAnuncios([]);
          setFiltrados([]);
        } else {
          setError('No se pudo conectar con el servidor.');
        }
        setLoading(false);
      });
  }, []);

  const handleFilter = ({ busqueda }) => {
    if (!busqueda) { setFiltrados(anuncios); return; }
    const q = busqueda.toLowerCase();
    setFiltrados(
      anuncios.filter(
        (a) => a.titulo?.toLowerCase().includes(q) || a.contenido?.toLowerCase().includes(q)
      )
    );
  };

  return (
    <main style={page}>
      <div style={pageHeader}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', margin: 0, color: '#0F0F0F' }}>
          Anuncios
        </h1>
        {!loading && !error && (
          <span style={countBadge}>{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      <FiltrosAnuncios onFilter={handleFilter} />

      {loading && (
        <div style={stateBox}>
          <span style={stateIcon}>⏳</span>
          <span>Cargando anuncios…</span>
        </div>
      )}

      {error && (
        <div style={{ ...stateBox, color: '#FF5C35' }}>
          <span style={stateIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && filtrados.length === 0 && (
        <div style={stateBox}>
          <span style={stateIcon}>🔍</span>
          <span>Sin resultados para tu búsqueda.</span>
        </div>
      )}

      {!loading && !error && filtrados.length > 0 && (
        <div style={grid}>
          {filtrados.map((anuncio) => (
            <AnuncioCard key={anuncio.anuncio_id ?? anuncio.id} anuncio={anuncio} />
          ))}
        </div>
      )}
    </main>
  );
}
