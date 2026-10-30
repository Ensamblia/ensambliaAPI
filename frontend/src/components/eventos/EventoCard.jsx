// src/components/eventos/EventoCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { Tag } from '@/components/ui';
import { lugarEvento } from '@/utils/eventos';
import styles from './EventoCard.module.css';

const fmt = (opciones) => new Intl.DateTimeFormat('es-ES', opciones);

export function EventoCard({ evento }) {
  const fecha = new Date(evento.fecha_inicio);
  const dia = fmt({ day: 'numeric' }).format(fecha);
  const mes = fmt({ month: 'short' }).format(fecha).replace('.', '');
  const diaSemana = fmt({ weekday: 'long' }).format(fecha);
  const hora = fmt({ hour: '2-digit', minute: '2-digit' }).format(fecha);

  return (
    <article className={styles.card}>
      <div className={styles.fecha} aria-label={`${diaSemana} ${dia} ${mes}`}>
        <span className={styles.dia}>{dia}</span>
        <span className={styles.mes}>{mes}</span>
      </div>
      <div className={styles.cuerpo}>
        <div className={styles.tags}>
          {evento.generos.map((g) => (
            <Tag key={g.genero_musical_id} size="sm" color="purple">
              {g.nombre}
            </Tag>
          ))}
          {evento.precio && <span className={styles.precio}>{evento.precio}</span>}
        </div>
        <Link to={`/eventos/${evento.evento_id}`} className={styles.titulo}>
          {evento.titulo}
        </Link>
        <p className={styles.meta}>
          <span>
            <Clock size={14} aria-hidden="true" /> <span className={styles.cap}>{diaSemana}</span> · {hora} h
          </span>
          <span>
            <MapPin size={14} aria-hidden="true" /> {lugarEvento(evento)}
          </span>
        </p>
        {evento.descripcion && <p className={styles.descripcion}>{evento.descripcion}</p>}
      </div>
    </article>
  );
}
