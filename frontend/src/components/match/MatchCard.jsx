// src/components/match/MatchCard.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { parseApiError } from '@/api/axios';
import { Button, Card, Tag } from '@/components/ui';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import { MapPin } from 'lucide-react';
import { motivosMatch, puntuacionMatch } from '@/utils/match';
import { AnilloMatch } from './AnilloMatch';
import styles from './MatchCard.module.css';

export function MatchCard({ match }) {
  const navigate = useNavigate();
  const [contactando, setContactando] = useState(false);
  const [error, setError] = useState('');

  const contactar = async () => {
    setError('');
    setContactando(true);
    try {
      const res = await api.post(`/chats/con/${match.perfil_id}`);
      navigate(`/chat?chat=${res.data.chat_id}`);
    } catch (err) {
      setError(parseApiError(err, 'No se pudo iniciar la conversación.'));
    } finally {
      setContactando(false);
    }
  };

  return (
    <Card as="article" padding="md" className={styles.card}>
      <div className={styles.cabecera}>
        <AnilloMatch valor={puntuacionMatch(match)} />
        <div className={styles.cabeceraTexto}>
          <Link to={`/perfiles/${match.perfil_id}`} className={styles.nombre}>
            {[match.nombre, match.apellido].filter(Boolean).join(' ')}
          </Link>
          {match.zona && (
            <span className={styles.zona}>
              <MapPin size={14} aria-hidden="true" /> {match.zona}
            </span>
          )}
        </div>
        <Tag size="sm" color="coral" className={styles.tipo}>
          {etiquetaTipoPerfil(match.tipo)}
        </Tag>
      </div>

      {match.instrumentos?.length > 0 && (
        <div className={styles.instrumentos}>
          {match.instrumentos.map((i) => (
            <Tag key={i} size="sm">{i}</Tag>
          ))}
        </div>
      )}

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
