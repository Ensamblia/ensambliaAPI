// src/pages/BandasPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Users } from 'lucide-react';
import api, { extractList } from '@/api/axios';
import { Button, Chip, EmptyState, PageHeader, Spinner, Tag } from '@/components/ui';
import styles from './ComunidadPage.module.css';

export function BandasPage() {
  const [bandas, setBandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { tipo: 'grupo', limit: 60 };
      if (soloDisponibles) params.disponibilidad = 'true';
      const res = await api.get('/perfiles/', { params });
      setBandas(res.data?.results ?? extractList(res));
    } catch {
      setError('No se pudieron cargar las bandas.');
    } finally {
      setLoading(false);
    }
  }, [soloDisponibles]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <main className={styles.page}>
      <PageHeader
        title="Bandas"
        icon={<Users size={22} />}
        tone="coral"
        subtitle="Crea tu banda o únete a una. Mira quién busca integrantes en tu zona."
      />

      <div className={styles.chips}>
        <Chip active={!soloDisponibles} onClick={() => setSoloDisponibles(false)}>
          Todas
        </Chip>
        <Chip active={soloDisponibles} onClick={() => setSoloDisponibles(true)}>
          Buscan integrantes
        </Chip>
      </div>

      {loading && <Spinner size="lg" aria-label="Cargando bandas" />}
      {!loading && error && <EmptyState icon="⚠️" title="No se pudo cargar" description={error} />}
      {!loading && !error && bandas.length === 0 && (
        <EmptyState icon="🎸" title="Todavía no hay bandas" description="Sé la primera persona en crear una." />
      )}

      {!loading && !error && bandas.length > 0 && (
        <div className={styles.grid}>
          {bandas.map((b) => (
            <article key={b.perfil_id} className={styles.card}>
              <div className={[styles.banda, styles.coral].join(' ')}>
                <span className={styles.bandaInicial} aria-hidden="true">
                  {b.nombre.charAt(0)}
                </span>
                <span className={styles.bandaMiembros}>
                  <Users size={14} aria-hidden="true" /> Grupo
                </span>
              </div>
              <h3 className={styles.nombre}>{b.nombre}</h3>
              <p className={styles.meta}>
                <MapPin size={14} aria-hidden="true" />
                {b.comarca_id ? 'Comarca' : 'Sin comarca'}
              </p>
              <p className={styles.bio}>{b.descripcion || 'Sin descripción.'}</p>
              <div className={styles.acciones}>
                <Button variant="primary" size="sm" to={`/perfiles/${b.perfil_id}`}>
                  Ver banda
                </Button>
                <Button variant="secondary" size="sm" to={`/grupos/${b.perfil_id}/solicitudes`}>
                  Solicitudes
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}