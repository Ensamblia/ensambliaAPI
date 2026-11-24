// src/components/multimedia/MediaGallery.jsx
import React, { useEffect, useState } from 'react';
import { getMultimediaByPerfil, deleteMultimedia } from '@/api/multimedia';
import { Button, Card, EmptyState, Spinner } from '@/components/ui';
import { MultimediaPreview } from './MultimediaPreview';
import styles from './MediaGallery.module.css';

export function MediaGallery({ perfilId, refreshKey = 0, onDeleted = null }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(false);

  const cargar = async () => {
    if (!perfilId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getMultimediaByPerfil(perfilId);
      setItems(data);
    } catch (err) {
      console.error('Error cargando multimedia:', err);
      setItems([]);
      setError(true);
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

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <Spinner size="md" aria-label="Cargando biblioteca" />
      </div>
    );
  }
  if (error) {
    return (
      <EmptyState
        compact
        icon="⚠️"
        title="No se pudo cargar tu biblioteca"
        description="Comprueba tu conexión e inténtalo de nuevo."
        action={
          <Button variant="secondary" size="sm" onClick={cargar}>
            Reintentar
          </Button>
        }
      />
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        compact
        icon="📚"
        title="Tu biblioteca está vacía"
        description="Usa el cuadro de arriba para subir tu primera foto, audio, vídeo o documento."
      />
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((m, idx) => (
        <Card key={m.multimedia_id} className={styles.item} padding="none">
          <MultimediaPreview 
          multimedia={m} 
          allMultimedia={items}
          initialIndex={idx}/>
          <button
            type="button"
            className={styles.deleteBtn}
            disabled={deleting === m.multimedia_id}
            onClick={() => handleDelete(m.multimedia_id)}
            aria-label="Borrar archivo"
            title="Borrar archivo"
          >
            ×
          </button>
        </Card>
      ))}
    </div>
  );
}