// src/pages/MusicosPage.jsx
// Maqueta: directorio de músicos (datos de ejemplo, sin back).
import React, { useMemo, useState } from 'react';
import { Guitar, MapPin } from 'lucide-react';
import { Avatar, Button, Chip, EmptyState, MuestraBadge, PageHeader, Tag } from '@/components/ui';
import { MUSICOS } from '@/data/maquetas';
import styles from './ComunidadPage.module.css';

const INSTRUMENTOS = [...new Set(MUSICOS.flatMap((m) => m.instrumentos))].sort();

export function MusicosPage() {
  const [instrumento, setInstrumento] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const visibles = useMemo(
    () =>
      MUSICOS.filter((m) => !instrumento || m.instrumentos.includes(instrumento)).filter(
        (m) => !soloDisponibles || m.disponible,
      ),
    [instrumento, soloDisponibles],
  );

  return (
    <main className={styles.page}>
      <PageHeader
        title="Músicos"
        icon={<Guitar size={22} />}
        tone="paper"
        badge={<MuestraBadge />}
        subtitle="Gente que toca cerca de ti. Filtra por instrumento y escríbeles sin salir de Ensamblia."
      />

      <div className={styles.chips}>
        <Chip active={!instrumento} onClick={() => setInstrumento('')}>
          Todos
        </Chip>
        {INSTRUMENTOS.map((i) => (
          <Chip key={i} active={instrumento === i} onClick={() => setInstrumento(i)}>
            {i}
          </Chip>
        ))}
        <span className={styles.sep} aria-hidden="true" />
        <Chip active={soloDisponibles} activeTone="green" onClick={() => setSoloDisponibles((v) => !v)}>
          Disponibles ahora
        </Chip>
      </div>

      {visibles.length === 0 ? (
        <EmptyState icon="🎸" title="Nadie con ese filtro" description="Prueba con otro instrumento." />
      ) : (
        <div className={styles.grid}>
          {visibles.map((m) => (
            <article key={m.id} className={styles.card}>
              <div className={styles.cabecera}>
                <Avatar name={m.nombre} size="lg" />
                <div className={styles.cabeceraTexto}>
                  <h3 className={styles.nombre}>{m.nombre}</h3>
                  <p className={styles.meta}>
                    <MapPin size={14} aria-hidden="true" />
                    {m.zona}
                  </p>
                </div>
              </div>
              {m.disponible && <span className={styles.disponible}>Disponible para proyectos</span>}
              <p className={styles.bio}>{m.bio}</p>
              <div className={styles.tags}>
                {m.instrumentos.map((i) => (
                  <Tag key={i} size="sm" color="yellow">{i}</Tag>
                ))}
                {m.estilos.map((e) => (
                  <Tag key={e} size="sm" color="purple">{e}</Tag>
                ))}
              </div>
              <div className={styles.acciones}>
                <Button variant="dark" size="sm" to="/chat">Escribir</Button>
                <Button variant="secondary" size="sm">Ver perfil</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
