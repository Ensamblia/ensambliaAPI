// src/components/eventos/ProximosEventos.jsx
import React, { useEffect, useState } from 'react';
import { listarEventos } from '@/api/eventos';
import { SectionLabel } from '@/components/ui';
import { EventoCard } from './EventoCard';
import styles from './ProximosEventos.module.css';

// Próximos eventos que publica o acoge un perfil. No pinta nada si no hay.
export function ProximosEventos({ perfilId, className = '' }) {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    let cancelado = false;
    listarEventos({ perfil: perfilId, limit: 5 })
      .then((data) => {
        if (!cancelado) setEventos(data.results ?? []);
      })
      .catch(() => {
        if (!cancelado) setEventos([]);
      });
    return () => {
      cancelado = true;
    };
  }, [perfilId]);

  if (eventos.length === 0) return null;

  return (
    <div className={className}>
      <SectionLabel tone="coral">PRÓXIMOS EVENTOS</SectionLabel>
      <div className={styles.lista}>
        {eventos.map((e) => (
          <EventoCard key={e.evento_id} evento={e} />
        ))}
      </div>
    </div>
  );
}
