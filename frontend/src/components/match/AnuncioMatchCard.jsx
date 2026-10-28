// src/components/match/AnuncioMatchCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Tag } from '@/components/ui';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import { motivosAnuncio } from '@/utils/match';
import styles from './MatchCard.module.css';

export function AnuncioMatchCard({ anuncio }) {
  const autor = anuncio.autor;
  return (
    <Card as="article" padding="md" className={styles.card}>
      <div className={styles.cabecera}>
        <Link to={`/anuncios/${anuncio.anuncio_id}`} className={styles.nombre}>
          {anuncio.titulo}
        </Link>
        {autor && (
          <Tag size="sm" color="coral">
            {etiquetaTipoPerfil(autor.tipo)}
          </Tag>
        )}
      </div>

      <ul className={styles.motivos}>
        {motivosAnuncio(anuncio).map((m) => (
          <li key={m} className={styles.motivo}>
            {m}
          </li>
        ))}
      </ul>

      <p className={styles.descripcion}>{anuncio.contenido}</p>

      <div className={styles.acciones}>
        <Button variant="primary" size="sm" to={`/anuncios/${anuncio.anuncio_id}`}>
          Ver anuncio
        </Button>
        {autor && (
          <Button variant="ghost" size="sm" to={`/perfiles/${autor.perfil_id}`}>
            {[autor.nombre, autor.apellido].filter(Boolean).join(' ')}
          </Button>
        )}
      </div>
    </Card>
  );
}
