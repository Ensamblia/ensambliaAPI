// src/components/eventos/EventoCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag } from '@/components/ui';
import { fechaEvento, lugarEvento } from '@/utils/eventos';
import styles from './EventoCard.module.css';

export function EventoCard({ evento }) {
  return (
    <Card as="article" padding="md" className={styles.card}>
      <span className={styles.fecha}>{fechaEvento(evento.fecha_inicio)}</span>
      <Link to={`/eventos/${evento.evento_id}`} className={styles.titulo}>
        {evento.titulo}
      </Link>
      <span className={styles.lugar}>{lugarEvento(evento)}</span>
      <div className={styles.pie}>
        {evento.generos.map((g) => (
          <Tag key={g.genero_musical_id} size="sm" color="purple">
            {g.nombre}
          </Tag>
        ))}
        {evento.precio && <span className={styles.precio}>{evento.precio}</span>}
      </div>
    </Card>
  );
}
