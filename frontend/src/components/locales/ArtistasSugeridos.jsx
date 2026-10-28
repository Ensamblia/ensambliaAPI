// src/components/locales/ArtistasSugeridos.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArtistasSugeridos } from '@/api/locales';
import { EmptyState, SectionLabel, Spinner, Tag } from '@/components/ui';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import { textoAfinidad } from '@/utils/tipoLocal';
import styles from './ArtistasSugeridos.module.css';

export function ArtistasSugeridos({ perfilId }) {
  const [artistas, setArtistas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    getArtistasSugeridos(perfilId, { limit: 10 })
      .then((data) => {
        if (!cancelado) setArtistas(data.results ?? []);
      })
      .catch(() => {
        if (!cancelado) setArtistas([]);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [perfilId]);

  return (
    <div className={styles.wrapper}>
      <SectionLabel tone="green">ARTISTAS QUE ENCAJAN CONTIGO</SectionLabel>
      {loading && <Spinner aria-label="Cargando artistas sugeridos" />}
      {!loading && artistas.length === 0 && (
        <EmptyState
          compact
          icon="🎤"
          title="Todavía no hay artistas que encajen"
          description="Añade los estilos de tu local para recibir mejores sugerencias."
        />
      )}
      <ul className={styles.lista}>
        {artistas.map((a) => (
          <li key={a.perfil_id} className={styles.item}>
            <Link to={`/perfiles/${a.perfil_id}`} className={styles.nombre}>
              {[a.nombre, a.apellido].filter(Boolean).join(' ')}
            </Link>
            <Tag size="sm">{etiquetaTipoPerfil(a.tipo)}</Tag>
            {textoAfinidad(a) && <span className={styles.afinidad}>{textoAfinidad(a)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
