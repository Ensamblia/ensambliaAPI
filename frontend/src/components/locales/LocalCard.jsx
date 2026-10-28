// src/components/locales/LocalCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag } from '@/components/ui';
import { etiquetaTipoLocal, textoAfinidad } from '@/utils/tipoLocal';
import styles from './LocalCard.module.css';

export function LocalCard({ local: perfil }) {
  const { local } = perfil;
  const afinidad = textoAfinidad(perfil);

  return (
    <Card className={styles.card} padding="md">
      <Link to={`/perfiles/${perfil.perfil_id}`} className={styles.nombre}>
        {perfil.nombre}
      </Link>
      <div className={styles.meta}>
        <span>{local.ciudad}</span>
        {local.aforo != null && <span>Aforo: {local.aforo}</span>}
      </div>
      <div className={styles.tipos}>
        {local.tipos.map((t) => (
          <Tag key={t} color="coral" size="sm">
            {etiquetaTipoLocal(t)}
          </Tag>
        ))}
      </div>
      {afinidad && <p className={styles.afinidad}>{afinidad}</p>}
    </Card>
  );
}
