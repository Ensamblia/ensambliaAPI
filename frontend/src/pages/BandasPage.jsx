// src/pages/BandasPage.jsx
// Maqueta: bandas de la comunidad (datos de ejemplo, sin back).
import React, { useMemo, useState } from 'react';
import { MapPin, Plus, Users } from 'lucide-react';
import { Button, Chip, MuestraBadge, PageHeader, Tag } from '@/components/ui';
import { BANDAS } from '@/data/maquetas';
import styles from './ComunidadPage.module.css';

export function BandasPage() {
  const [soloBuscan, setSoloBuscan] = useState(false);
  const visibles = useMemo(() => BANDAS.filter((b) => !soloBuscan || b.buscan.length), [soloBuscan]);

  return (
    <main className={styles.page}>
      <PageHeader
        title="Bandas"
        icon={<Users size={22} />}
        tone="coral"
        badge={<MuestraBadge />}
        subtitle="Crea tu banda o únete a una. Mira quién busca integrantes en tu zona."
        actions={
          <Button variant="primary" leftIcon={<Plus size={16} strokeWidth={2.5} />}>
            Crear banda
          </Button>
        }
      />

      <div className={styles.chips}>
        <Chip active={!soloBuscan} onClick={() => setSoloBuscan(false)}>
          Todas
        </Chip>
        <Chip active={soloBuscan} onClick={() => setSoloBuscan(true)}>
          Buscan integrantes
        </Chip>
      </div>

      <div className={styles.grid}>
        {visibles.map((b) => (
          <article key={b.id} className={styles.card}>
            <div className={[styles.banda, styles[b.tono]].join(' ')}>
              <span className={styles.bandaInicial} aria-hidden="true">
                {b.nombre.charAt(0)}
              </span>
              <span className={styles.bandaMiembros}>
                <Users size={14} aria-hidden="true" /> {b.miembros} miembros
              </span>
            </div>
            <h3 className={styles.nombre}>{b.nombre}</h3>
            <p className={styles.meta}>
              <MapPin size={14} aria-hidden="true" />
              {b.zona}
            </p>
            <p className={styles.bio}>{b.bio}</p>
            <div className={styles.tags}>
              {b.estilos.map((e) => (
                <Tag key={e} size="sm" color="purple">{e}</Tag>
              ))}
            </div>
            {b.buscan.length > 0 && (
              <p className={styles.buscan}>
                <strong>Buscan:</strong> {b.buscan.join(', ')}
              </p>
            )}
            <div className={styles.acciones}>
              <Button variant={b.buscan.length ? 'primary' : 'secondary'} size="sm">
                {b.buscan.length ? 'Quiero unirme' : 'Seguir'}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
