import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Comentarios } from '../components/comentarios/Comentarios';
import { AutorNombre } from '../components/perfil/AutorNombre';

const page = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '40px 24px 64px',
};

const backLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#8A8A8A',
  textDecoration: 'none',
  marginBottom: '24px',
};

const accentTag = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 9px',
  backgroundColor: '#FFF0EC',
  color: '#FF5C35',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  alignSelf: 'flex-start',
};

const title = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.75rem',
  fontWeight: 800,
  color: '#0F0F0F',
  letterSpacing: '-0.03em',
  lineHeight: 1.2,
  margin: '12px 0 8px',
};

const dateText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#D4D4D4',
  letterSpacing: '0.01em',
  marginBottom: '20px',
};

const porLine = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  marginBottom: '20px',
};

const body = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '15px',
  color: '#2B2B2B',
  lineHeight: 1.7,
  margin: '0 0 32px',
  whiteSpace: 'pre-wrap',
};

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

const TIPO_LABELS = {
  1: 'Busco músico',
  2: 'Ofrezco servicio',
  3: 'Vendo instrumento',
  4: 'Busco banda',
};

export function AnuncioDetailPage() {
  const { id } = useParams();
  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/anuncios/${id}`)
      .then((res) => setAnuncio(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('not-found');
        } else {
          setError('server');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fecha = anuncio?.fecha_publicacion
    ? new Date(anuncio.fecha_publicacion).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <main style={page}>
      <Link to="/anuncios" style={backLink}>← Volver a anuncios</Link>

      {loading && (
        <div style={stateBox}>
          <span style={stateIcon}>⏳</span>
          <span>Cargando anuncio…</span>
        </div>
      )}

      {!loading && error === 'not-found' && (
        <div style={stateBox}>
          <span style={stateIcon}>🔍</span>
          <span>Este anuncio no existe o fue eliminado.</span>
        </div>
      )}

      {!loading && error === 'server' && (
        <div style={{ ...stateBox, color: '#FF5C35' }}>
          <span style={stateIcon}>⚠️</span>
          <span>No se pudo cargar el anuncio.</span>
        </div>
      )}

      {!loading && !error && anuncio && (
        <>
          {TIPO_LABELS[anuncio.tipo_anuncio_id] && (
            <span style={accentTag}>{TIPO_LABELS[anuncio.tipo_anuncio_id]}</span>
          )}
          <h1 style={title}>{anuncio.titulo || 'Sin título'}</h1>
          <div style={dateText}>{fecha || '—'}</div>
          <p style={porLine}>
            Publicado por <AutorNombre perfilId={anuncio.perfil_id} />
          </p>
          <p style={body}>{anuncio.contenido || 'Sin descripción.'}</p>

          <Comentarios anuncioId={anuncio.anuncio_id} />
        </>
      )}
    </main>
  );
}
