import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { EditarMediosModal } from '../multimedia/EditarMediosModal';

/* ── Styles ── */
const emptyText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  padding: '16px 0',
};

const list = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const item = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  border: '1px solid #EBEBEB',
  borderRadius: '10px',
  backgroundColor: '#FFFFFF',
  transition: 'border-color 140ms ease',
};

const itemInfo = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  minWidth: 0,
  flex: 1,
};

const itemTitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: '#0F0F0F',
  letterSpacing: '-0.01em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const itemMeta = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11.5px',
  color: '#8A8A8A',
};

const actions = {
  display: 'flex',
  gap: '8px',
  flexShrink: 0,
};

const btnBase = {
  padding: '7px 14px',
  borderRadius: '7px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  letterSpacing: '-0.01em',
  transition: 'background 140ms ease, border-color 140ms ease, color 140ms ease',
};

const btnMedia = {
  ...btnBase,
  backgroundColor: '#FFF0EC',
  color: '#FF5C35',
};

const btnDanger = {
  ...btnBase,
  backgroundColor: 'transparent',
  color: '#E0402B',
  border: '1px solid #F5C6C2',
};

const loading = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  padding: '12px 0',
};

export function MisAnuncios({ perfilId, refreshKey = 0 }) {
  const [anuncios, setAnuncios] = useState([]);
  const [loading_, setLoading] = useState(true);
  const [editingAnuncio, setEditingAnuncio] = useState(null);

  const cargar = async () => {
    if (!perfilId) return;
    setLoading(true);
    try {
      const res = await api.get('/anuncios/', {
        params: { perfil: perfilId, limit: 100 },
      });
      const data = res.data?.results ?? res.data ?? [];
      setAnuncios(data);
    } catch (err) {
      console.error('Error cargando mis anuncios:', err);
      setAnuncios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilId, refreshKey]);

  const handleDelete = async (anuncioId) => {
    if (!window.confirm('¿Borrar este anuncio?')) return;
    try {
      await api.delete(`/anuncios/${anuncioId}/`);
      setAnuncios((prev) => prev.filter((a) => a.anuncio_id !== anuncioId));
    } catch (err) {
      console.error(err);
      alert('No se pudo borrar el anuncio');
    }
  };

  if (!perfilId) {
    return <p style={emptyText}>Guarda tu perfil primero para ver tus anuncios.</p>;
  }

  if (loading_) {
    return <p style={loading}>Cargando tus anuncios…</p>;
  }

  if (anuncios.length === 0) {
    return (
      <p style={emptyText}>
        Aún no has publicado ningún anuncio.{' '}
        <Link to="/anuncios/crear" style={{ color: '#FF5C35', fontWeight: 600, textDecoration: 'none' }}>
          Crea el primero
        </Link>
      </p>
    );
  }

  return (
    <>
      <div style={list}>
        {anuncios.map((a) => {
          const count = a.multimedias?.length || 0;
          return (
            <div key={a.anuncio_id} style={item}>
              <div style={itemInfo}>
                <Link to={`/anuncios/${a.anuncio_id}`} style={itemTitle}>
                  {a.titulo || 'Sin título'}
                </Link>
                <span style={itemMeta}>
                  {new Date(a.fecha_publicacion).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                  {count > 0 ? ` · ${count} archivo${count !== 1 ? 's' : ''}` : ''}
                </span>
              </div>
              <div style={actions}>
                <button
                  style={btnMedia}
                  onClick={() => setEditingAnuncio(a)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FFD9CC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF0EC'; }}
                >
                  📎 Multimedia
                </button>
                <button
                  style={btnDanger}
                  onClick={() => handleDelete(a.anuncio_id)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E0402B'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#F5C6C2'; }}
                >
                  Borrar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingAnuncio && (
        <EditarMediosModal
          anuncio={editingAnuncio}
          perfilId={perfilId}
          onClose={() => setEditingAnuncio(null)}
          onSaved={cargar}
        />
      )}
    </>
  );
}