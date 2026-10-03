import React, { useEffect, useState } from 'react';
import { getMultimediaByPerfil, deleteMultimedia } from '../../api/multimedia';
import { MultimediaPreview } from './MultimediaPreview';

/* ── Styles ── */
const emptyText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  textAlign: 'center',
  padding: '24px',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '12px',
};

const cardWrapper = {
  position: 'relative',
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#FFFFFF',
  transition: 'border-color 140ms ease, box-shadow 140ms ease',
};

const deleteBtn = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: 'rgba(224, 64, 43, 0.9)',
  color: '#FFFFFF',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 140ms ease, transform 140ms ease',
  zIndex: 10,
};

const loading = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  padding: '12px 0',
};

export function MediaGallery({ perfilId, refreshKey = 0, onDeleted = null }) {
  const [items, setItems] = useState([]);
  const [loading_, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const cargar = async () => {
    if (!perfilId) return;
    setLoading(true);
    try {
      const data = await getMultimediaByPerfil(perfilId);
      setItems(data);
    } catch (err) {
      console.error('Error cargando multimedia:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilId, refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Borrar este archivo?')) return;
    setDeleting(id);
    try {
      await deleteMultimedia(id);
      setItems((prev) => prev.filter((m) => m.multimedia_id !== id));
      if (onDeleted) onDeleted(id);
    } catch (err) {
      console.error('Error al borrar:', err);
      alert('No se pudo borrar el archivo');
    } finally {
      setDeleting(null);
    }
  };

  if (loading_) {
    return <p style={loading}>Cargando tu biblioteca…</p>;
  }

  if (items.length === 0) {
    return (
      <p style={emptyText}>
        Aún no has subido ningún archivo. ¡Sube tu primera foto, audio, vídeo o documento!
      </p>
    );
  }

  return (
    <div style={grid}>
      {items.map((m) => (
        <div
          key={m.multimedia_id}
          style={cardWrapper}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#D0D0D0';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#EBEBEB';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <MultimediaPreview multimedia={m} />
          <button
            style={{
              ...deleteBtn,
              opacity: deleting === m.multimedia_id ? 0.5 : 1,
            }}
            disabled={deleting === m.multimedia_id}
            onClick={() => handleDelete(m.multimedia_id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#B3261E';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(224, 64, 43, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Borrar archivo"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}