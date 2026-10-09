import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { getMultimediaByPerfil } from '../../api/multimedia';
import { FileUploader } from './FileUploader';
import { MultimediaPreview } from './MultimediaPreview';

/* ── Overlay ── */
const overlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 15, 15, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  padding: '24px',
  maxWidth: '720px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
};

const title = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.1rem',
  fontWeight: 800,
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
  margin: 0,
};

const closeBtn = {
  background: 'none',
  border: 'none',
  fontSize: '22px',
  color: '#8A8A8A',
  cursor: 'pointer',
  lineHeight: 1,
  padding: '4px',
};

const sectionTitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  color: '#D4D4D4',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '10px',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '10px',
};

const cardItem = (selected) => ({
  position: 'relative',
  border: `2px solid ${selected ? '#FF5C35' : 'transparent'}`,
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'border-color 140ms ease',
});

const checkBadge = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  fontWeight: 700,
  zIndex: 10,
};

const emptyText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  padding: '16px',
  textAlign: 'center',
};

const actions = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  borderTop: '1px solid #EBEBEB',
  paddingTop: '16px',
};

const btnSecondary = {
  padding: '10px 20px',
  backgroundColor: 'transparent',
  color: '#555555',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnPrimary = {
  padding: '10px 22px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 140ms ease',
};

const btnPrimaryDisabled = {
  ...btnPrimary,
  backgroundColor: '#F2B3A2',
  cursor: 'not-allowed',
};

const errorText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  color: '#E0402B',
  margin: 0,
};

export function EditarMediosModal({ anuncio, perfilId, onClose, onSaved }) {
  const [biblioteca, setBiblioteca] = useState([]);
  const [vinculados, setVinculados] = useState(new Set());
  const [vinculadosOriginal, setVinculadosOriginal] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Cargar biblioteca + vinculados
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      try {
        const bibliotecaData = await getMultimediaByPerfil(perfilId);
        if (cancelado) return;
        setBiblioteca(bibliotecaData);

        const vinculadosIds = new Set(
          (anuncio.multimedias || []).map((m) => m.multimedia_id)
        );
        setVinculados(vinculadosIds);
        setVinculadosOriginal(new Set(vinculadosIds));
      } catch (err) {
        console.error(err);
        if (!cancelado) setError('No se pudo cargar la biblioteca.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilId, refreshKey]);

  const toggle = (id) => {
    setVinculados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleUploaded = () => {
    // Refrescar la biblioteca tras subir un archivo
    setRefreshKey((k) => k + 1);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const agregar = [...vinculados].filter((id) => !vinculadosOriginal.has(id));
      const quitar = [...vinculadosOriginal].filter((id) => !vinculados.has(id));

      // Agregar
      if (agregar.length > 0) {
        await api.post(`/anuncios/${anuncio.anuncio_id}/multimedia/`, {
          multimedia_ids: agregar,
        });
      }

      // Quitar
      for (const id of quitar) {
        await api.delete(`/anuncios/${anuncio.anuncio_id}/multimedia/${id}/`);
      }

      onSaved && onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const hayCambios =
    vinculados.size !== vinculadosOriginal.size ||
    [...vinculados].some((id) => !vinculadosOriginal.has(id));

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>
            <h2 style={title}>Multimedia del anuncio</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: '#8A8A8A', margin: '4px 0 0' }}>
              Selecciona los archivos de tu biblioteca para este anuncio.
            </p>
          </div>
          <button style={closeBtn} onClick={onClose} title="Cerrar">×</button>
        </div>

        {error && <p style={errorText}>⚠️ {error}</p>}

        {/* Subir nuevos */}
        <div>
          <p style={sectionTitle}>Subir nuevo archivo</p>
          <FileUploader
            label="Arrastra o haz click para subir un archivo nuevo"
            onUploaded={handleUploaded}
          />
        </div>

        {/* Biblioteca */}
        <div>
          <p style={sectionTitle}>Tu biblioteca ({biblioteca.length})</p>

          {loading && <p style={emptyText}>Cargando biblioteca…</p>}

          {!loading && biblioteca.length === 0 && (
            <p style={emptyText}>
              No tienes archivos en tu biblioteca. Sube uno arriba.
            </p>
          )}

          {!loading && biblioteca.length > 0 && (
            <div style={grid}>
              {biblioteca.map((m) => {
                const seleccionado = vinculados.has(m.multimedia_id);
                return (
                  <div
                    key={m.multimedia_id}
                    style={cardItem(seleccionado)}
                    onClick={() => toggle(m.multimedia_id)}
                  >
                    {seleccionado && <div style={checkBadge}>✓</div>}
                    <MultimediaPreview multimedia={m} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={actions}>
          <button style={btnSecondary} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            style={saving ? btnPrimaryDisabled : btnPrimary}
            onClick={handleSave}
            disabled={saving || !hayCambios}
            onMouseEnter={(e) => { if (!saving && hayCambios) e.currentTarget.style.background = '#E04820'; }}
            onMouseLeave={(e) => { if (!saving && hayCambios) e.currentTarget.style.background = '#FF5C35'; }}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}