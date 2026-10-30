// src/components/match/MatchCard.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contactarPerfil } from '@/utils/contactar';
import { Button, Card, Tag } from '@/components/ui';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import { motivosMatch } from '@/utils/match';
import styles from './MatchCard.module.css';

export function MatchCard({ match }) {
  const navigate = useNavigate();
  const [contactando, setContactando] = useState(false);
  const [error, setError] = useState('');

  const contactar = async () => {
    setError('');
    setContactando(true);
    setError(await contactarPerfil(match.perfil_id, navigate));
    setContactando(false);
  };

  return (
    <Card as="article" padding="md" className={styles.card}>
      <div className={styles.cabecera}>
        <Link to={`/perfiles/${match.perfil_id}`} className={styles.nombre}>
          {[match.nombre, match.apellido].filter(Boolean).join(' ')}
        </Link>
        <Tag size="sm" color="coral">
          {etiquetaTipoPerfil(match.tipo)}
        </Tag>
      </div>

      <ul className={styles.motivos}>
        {motivosMatch(match).map((m) => (
          <li key={m} className={styles.motivo}>
            {m}
          </li>
        ))}
      </ul>

      {match.descripcion && <p className={styles.descripcion}>{match.descripcion}</p>}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.acciones}>
        <Button variant="primary" size="sm" onClick={contactar} loading={contactando}>
          Contactar
        </Button>
        <Button variant="ghost" size="sm" to={`/perfiles/${match.perfil_id}`}>
          Ver perfil
        </Button>
      </div>
    </Card>
  );
}
