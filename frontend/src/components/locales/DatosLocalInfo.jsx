// src/components/locales/DatosLocalInfo.jsx
import React, { useEffect, useState } from 'react';
import { getLocal } from '@/api/locales';
import { SectionLabel, Tag } from '@/components/ui';
import { etiquetaTipoLocal } from '@/utils/tipoLocal';
import styles from './DatosLocalInfo.module.css';

export function DatosLocalInfo({ perfilId, className = '' }) {
  const [local, setLocal] = useState(null);

  useEffect(() => {
    let cancelado = false;
    getLocal(perfilId)
      .then((data) => {
        if (!cancelado) setLocal(data.local);
      })
      .catch(() => {
        if (!cancelado) setLocal(null);
      });
    return () => {
      cancelado = true;
    };
  }, [perfilId]);

  if (!local) return null;

  return (
    <div className={className}>
      <SectionLabel tone="coral">EL LOCAL</SectionLabel>
      <dl className={styles.datos}>
        <dt>Ciudad</dt>
        <dd>{local.ciudad}</dd>
        <dt>Dirección</dt>
        <dd>{local.direccion}</dd>
      </dl>
      {local.aforo != null && <p className={styles.aforo}>Aforo: {local.aforo} personas</p>}
      <div className={styles.tipos}>
        {local.tipos.map((t) => (
          <Tag key={t} color="coral">
            {etiquetaTipoLocal(t)}
          </Tag>
        ))}
      </div>
    </div>
  );
}
