// src/components/anuncios/MisAnuncios.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { parseApiError } from '@/api/axios';
import { Button, Card, EmptyState, Spinner } from '@/components/ui';
import { EditarMediosModal } from '@/components/multimedia/EditarMediosModal';
import styles from './MisAnuncios.module.css';

export function MisAnuncios({ perfilId, refreshKey = 0 }) {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
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
      alert(parseApiError(err, 'No se pudo borrar el anuncio'));
    }
  };

  if (!perfilId) {
    return (
      <EmptyState
        compact
        title="Guarda tu perfil primero"
        description="Así podrás ver y gestionar tus anuncios."
      />
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <Spinner size="md" aria-label="Cargando anuncios" />
      </div>
    );
  }

  if (anuncios.length === 0) {
    return (
      <EmptyState
        compact
        icon="📝"
        title="Aún no has publicado ningún anuncio"
        description="Crea el primero para que otros músicos te encuentren."
        action={
          <Link to="/anuncios/crear">
            <Button variant="primary" size="sm">Crear anuncio</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className={styles.list}>
        {anuncios.map((a) => {
          const count = a.multimedias?.length || 0;
          return (
            <Card key={a.anuncio_id} className={styles.item} padding="none">
              <div className={styles.itemInfo}>
                <Link to={`/anuncios/${a.anuncio_id}`} className={styles.itemTitle}>
                  {a.titulo || 'Sin título'}
                </Link>
                <span className={styles.itemMeta}>
                  {new Date(a.fecha_publicacion).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {count > 0 ? ` · ${count} archivo${count !== 1 ? 's' : ''}` : ''}
                </span>
              </div>
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingAnuncio(a)}
                >
                  📎 Multimedia
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(a.anuncio_id)}
                >
                  Borrar
                </Button>
              </div>
            </Card>
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