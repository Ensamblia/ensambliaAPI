// src/components/multimedia/EditarMediosModal.jsx
import React, { useEffect, useState } from 'react';
import api from '@/api/axios';
import { getMultimediaByPerfil } from '@/api/multimedia';
import { Button, Card, EmptyState, Modal, Spinner } from '@/components/ui';
import { FileUploader } from './FileUploader';
import { MultimediaPreview } from './MultimediaPreview';
import styles from './EditarMediosModal.module.css';

export function EditarMediosModal({ anuncio, perfilId, onClose, onSaved }) {
  const [biblioteca, setBiblioteca] = useState([]);
  const [vinculados, setVinculados] = useState(new Set());
  const [vinculadosOriginal, setVinculadosOriginal] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      try {
        const bibliotecaData = await getMultimediaByPerfil(perfilId);
        if (cancelado) return;
        setBiblioteca(bibliotecaData);

        const vinculadosIds = new Set(
          (anuncio.multimedias || []).map((m) => m.multimedia_id),
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
    return () => {
      cancelado = true;
    };
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
    setRefreshKey((k) => k + 1);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const agregar = [...vinculados].filter((id) => !vinculadosOriginal.has(id));
      const quitar = [...vinculadosOriginal].filter((id) => !vinculados.has(id));

      if (agregar.length > 0) {
        await api.post(`/anuncios/${anuncio.anuncio_id}/multimedia/`, {
          multimedia_ids: agregar,
        });
      }

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

  const footer = (
    <>
      <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleSave}
        loading={saving}
        disabled={!hayCambios}
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title="Multimedia del anuncio"
      footer={footer}
      size="lg"
    >
      <div className={styles.body}>
        {error && <p className={styles.error}>{error}</p>}

        <div>
          <p className={styles.sectionTitle}>Subir nuevo archivo</p>
          <FileUploader
            label="Arrastra o haz click para subir un archivo nuevo"
            onUploaded={handleUploaded}
          />
        </div>

        <div>
          <p className={styles.sectionTitle}>
            Tu biblioteca ({biblioteca.length})
          </p>

          {loading && (
            <div className={styles.loadingBox}>
              <Spinner size="md" aria-label="Cargando biblioteca" />
            </div>
          )}

          {!loading && biblioteca.length === 0 && (
            <EmptyState
              compact
              title="No tienes archivos"
              description="Sube uno arriba para vincularlo al anuncio."
            />
          )}

          {!loading && biblioteca.length > 0 && (
            <div className={styles.grid}>
              {biblioteca.map((m) => {
                const seleccionado = vinculados.has(m.multimedia_id);
                return (
                  <Card
                    key={m.multimedia_id}
                    className={[
                      styles.item,
                      seleccionado ? styles.itemSelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    padding="none"
                    onClick={() => toggle(m.multimedia_id)}
                  >
                    {seleccionado && (
                      <div className={styles.checkBadge} aria-hidden="true">
                        ✓
                      </div>
                    )}
                    <MultimediaPreview multimedia={m} />
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}