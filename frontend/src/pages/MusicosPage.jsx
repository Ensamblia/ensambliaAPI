// src/pages/MusicosPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Guitar, MapPin } from 'lucide-react';
import api, { extractList } from '@/api/axios';
import { Avatar, Button, Chip, EmptyState, PageHeader, Spinner } from '@/components/ui';
import styles from './ComunidadPage.module.css';

export function MusicosPage() {
  const [musicos, setMusicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [instrumentos, setInstrumentos] = useState([]);
  const [instrumento, setInstrumento] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(true);

  // Mapa: perfil_id -> Set(instrumento_id)
  const [instrumentosPorPerfil, setInstrumentosPorPerfil] = useState({});

  // 1. Cargar instrumentos (catálogo) y todos los perfil-instrumentos
  useEffect(() => {
    let cancelado = false;
    Promise.all([
      api.get('/instrumentos/').then((res) => extractList(res)).catch(() => []),
      api.get('/perfil-instrumentos/').then((res) => extractList(res)).catch(() => []),
    ]).then(([listaInstrumentos, listaPivotes]) => {
      if (cancelado) return;
      setInstrumentos(listaInstrumentos);
      // Agrupar pivotes por perfil_id
      const mapa = {};
      listaPivotes.forEach(({ perfil_id, instrumento_id }) => {
        if (!mapa[perfil_id]) mapa[perfil_id] = new Set();
        mapa[perfil_id].add(instrumento_id);
      });
      setInstrumentosPorPerfil(mapa);
    });
    return () => { cancelado = true; };
  }, []);

  // 2. Cargar músicos
  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { tipo: 'usuario', limit: 60 };
      if (soloDisponibles) params.disponibilidad = 'true';
      const res = await api.get('/perfiles/', { params });
      const lista = res.data?.results ?? extractList(res);
      setMusicos(lista);
    } catch {
      setError('No se pudieron cargar los músicos.');
    } finally {
      setLoading(false);
    }
  }, [soloDisponibles]);

  useEffect(() => { cargar(); }, [cargar]);

  // 3. Filtrado por instrumento (en cliente, cruzando con las pivotes)
  const visibles = useMemo(() => {
    if (!instrumento) return musicos;
    const instrumentoObj = instrumentos.find((i) => i.nombre === instrumento);
    if (!instrumentoObj) return musicos;
    return musicos.filter((m) => {
      const set = instrumentosPorPerfil[m.perfil_id];
      return set && set.has(instrumentoObj.instrumento_id);
    });
  }, [musicos, instrumento, instrumentos, instrumentosPorPerfil]);

  return (
    <main className={styles.page}>
      <PageHeader
        title="Músicos"
        icon={<Guitar size={22} />}
        tone="paper"
        subtitle="Gente que toca cerca de ti. Filtra por instrumento y escríbeles sin salir de Ensamblia."
      />

      <div className={styles.chips}>
        <Chip active={!instrumento} onClick={() => setInstrumento('')}>
          Todos
        </Chip>
        {instrumentos.slice(0, 12).map((i) => (
          <Chip key={i.instrumento_id} active={instrumento === i.nombre} onClick={() => setInstrumento(i.nombre)}>
            {i.nombre}
          </Chip>
        ))}
        <span className={styles.sep} aria-hidden="true" />
        <Chip active={soloDisponibles} activeTone="green" onClick={() => setSoloDisponibles((v) => !v)}>
          Disponibles ahora
        </Chip>
      </div>

      {loading && <Spinner size="lg" aria-label="Cargando músicos" />}
      {!loading && error && <EmptyState icon="⚠️" title="No se pudo cargar" description={error} />}
      {!loading && !error && visibles.length === 0 && (
        <EmptyState icon="🎸" title="Nadie con ese filtro" description="Prueba con otro instrumento o quita el filtro de disponibilidad." />
      )}

      {!loading && !error && visibles.length > 0 && (
        <div className={styles.grid}>
          {visibles.map((m) => (
            <article key={m.perfil_id} className={styles.card}>
              <div className={styles.cabecera}>
                <Avatar name={m.nombre} src={m.foto_url} size="lg" />
                <div className={styles.cabeceraTexto}>
                  <h3 className={styles.nombre}>{[m.nombre, m.apellido].filter(Boolean).join(' ')}</h3>
                  <p className={styles.meta}>
                    <MapPin size={14} aria-hidden="true" />
                    {m.comarca_id ? 'Comarca' : 'Sin comarca'}
                  </p>
                </div>
              </div>
              {m.disponibilidad && <span className={styles.disponible}>Disponible para proyectos</span>}
              <p className={styles.bio}>{m.descripcion || 'Sin descripción.'}</p>
              <div className={styles.acciones}>
                <Button variant="dark" size="sm" to="/chat">Escribir</Button>
                <Button variant="secondary" size="sm" to={`/perfiles/${m.perfil_id}`}>Ver perfil</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}