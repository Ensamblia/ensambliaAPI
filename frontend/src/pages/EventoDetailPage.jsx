// src/pages/EventoDetailPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { parseApiError } from '@/api/axios';
import { borrarEvento, getEvento, misPerfiles } from '@/api/eventos';
import { AuthContext } from '@/context/AuthContext';
import { Button, Card, EmptyState, PageHeader, SectionLabel, Spinner, Tag } from '@/components/ui';
import { fechaEvento } from '@/utils/eventos';
import styles from './EventoDetailPage.module.css';

export function EventoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [evento, setEvento] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [esAutor, setEsAutor] = useState(false);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setEstado('cargando');
    getEvento(id)
      .then((data) => {
        if (cancelado) return;
        setEvento(data);
        setEstado('ok');
      })
      .catch((err) => {
        if (!cancelado) setEstado(err.response?.status === 404 ? 'no-existe' : 'error');
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !evento) {
      setEsAutor(false);
      return;
    }
    misPerfiles()
      .then((lista) => setEsAutor(lista.some((p) => p.perfil_id === evento.autor.perfil_id)))
      .catch(() => setEsAutor(false));
  }, [user, evento]);

  const borrar = async () => {
    if (!window.confirm('¿Seguro que quieres borrar este evento?')) return;
    setProcesando(true);
    try {
      await borrarEvento(id);
      navigate('/eventos');
    } catch (err) {
      setError(parseApiError(err, 'No se pudo borrar el evento.'));
      setProcesando(false);
    }
  };

  const contactar = async () => {
    setProcesando(true);
    try {
      const res = await api.post(`/chats/con/${evento.autor.perfil_id}`);
      navigate(`/chat?chat=${res.data.chat_id}`);
    } catch (err) {
      setError(parseApiError(err, 'No se pudo iniciar la conversación.'));
      setProcesando(false);
    }
  };

  if (estado === 'cargando') {
    return (
      <main className={styles.page}>
        <div className={styles.stateBox}>
          <Spinner size="lg" aria-label="Cargando evento" />
        </div>
      </main>
    );
  }

  if (estado !== 'ok') {
    return (
      <main className={styles.page}>
        <PageHeader title="Evento" backTo="/eventos" backLabel="Eventos" />
        <EmptyState
          icon="📅"
          title={estado === 'no-existe' ? 'Este evento no existe' : 'No se pudo cargar el evento'}
          description="Puede que se haya borrado o que la dirección no sea correcta."
        />
      </main>
    );
  }

  const autorNombre = [evento.autor.nombre, evento.autor.apellido].filter(Boolean).join(' ');

  return (
    <main className={styles.page}>
      <PageHeader title={evento.titulo} backTo="/eventos" backLabel="Eventos" />

      {error && <p className={styles.error}>{error}</p>}

      <Card padding="lg" className={styles.card}>
        <p className={styles.fecha}>{fechaEvento(evento.fecha_inicio)}</p>

        <dl className={styles.datos}>
          <dt>Dónde</dt>
          <dd>
            {evento.local ? (
              <Link to={`/perfiles/${evento.local.perfil_id}`}>{evento.local.nombre}</Link>
            ) : (
              evento.lugar || 'Por confirmar'
            )}
            {' · '}
            {evento.ciudad}
          </dd>
          {evento.precio && (
            <>
              <dt>Precio</dt>
              <dd>{evento.precio}</dd>
            </>
          )}
          <dt>Publicado por</dt>
          <dd>
            <Link to={`/perfiles/${evento.autor.perfil_id}`}>{autorNombre}</Link>
          </dd>
        </dl>

        {evento.generos.length > 0 && (
          <div className={styles.tags}>
            {evento.generos.map((g) => (
              <Tag key={g.genero_musical_id} color="purple">
                {g.nombre}
              </Tag>
            ))}
          </div>
        )}

        {evento.descripcion && (
          <div className={styles.descripcion}>
            <SectionLabel tone="blue">DESCRIPCIÓN</SectionLabel>
            <p>{evento.descripcion}</p>
          </div>
        )}

        {user && (
          <div className={styles.acciones}>
            {esAutor ? (
              <Button variant="danger" size="sm" onClick={borrar} loading={procesando}>
                Borrar evento
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={contactar} loading={procesando}>
                Contactar con {autorNombre}
              </Button>
            )}
          </div>
        )}
      </Card>
    </main>
  );
}
