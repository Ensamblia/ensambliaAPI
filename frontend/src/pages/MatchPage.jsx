// src/pages/MatchPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import api, { extractList, parseApiError } from '@/api/axios';
import { getMatches } from '@/api/match';
import { MatchCard } from '@/components/match/MatchCard';
import { Button, EmptyState, PageHeader, Select, Spinner } from '@/components/ui';
import { OPCIONES_BUSCO } from '@/utils/match';
import styles from './MatchPage.module.css';

export function MatchPage() {
  const [busco, setBusco] = useState('musico');
  const [instrumento, setInstrumento] = useState('');
  const [instrumentos, setInstrumentos] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sinPerfil, setSinPerfil] = useState(false);
  const ultimaPeticionRef = useRef(0);

  useEffect(() => {
    api
      .get('/instrumentos/')
      .then((res) => setInstrumentos(extractList(res)))
      .catch(() => setInstrumentos([]));
  }, []);

  useEffect(() => {
    const peticion = ++ultimaPeticionRef.current;
    setLoading(true);
    setError('');
    const params = { busco };
    if (busco === 'musico' && instrumento) params.instrumento = instrumento;
    getMatches(params)
      .then((data) => {
        if (peticion !== ultimaPeticionRef.current) return;
        setSinPerfil(false);
        setMatches(data.results ?? []);
      })
      .catch((err) => {
        if (peticion !== ultimaPeticionRef.current) return;
        const mensaje = parseApiError(err, 'No se pudieron cargar tus matches.');
        setSinPerfil(err.response?.status === 400 && /perfil/i.test(mensaje));
        setError(mensaje);
        setMatches([]);
      })
      .finally(() => {
        if (peticion === ultimaPeticionRef.current) setLoading(false);
      });
  }, [busco, instrumento]);

  return (
    <main className={styles.page}>
      <PageHeader
        title="Match"
        subtitle="Sugerencias por cercanía y estilos en común, con el motivo de cada una."
      />

      <div className={styles.filtros}>
        <div className={styles.opciones} role="group" aria-label="Qué buscas">
          {OPCIONES_BUSCO.map((o) => (
            <button
              key={o.value}
              type="button"
              className={[styles.opcion, busco === o.value ? styles.opcionActiva : '']
                .filter(Boolean)
                .join(' ')}
              aria-pressed={busco === o.value}
              onClick={() => setBusco(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>

        {busco === 'musico' && (
          <div className={styles.select}>
            <Select
              value={instrumento}
              onChange={(e) => setInstrumento(e.target.value)}
              aria-label="Instrumento que buscas"
            >
              <option value="">Cualquier instrumento</option>
              {instrumentos.map((i) => (
                <option key={i.instrumento_id} value={i.instrumento_id}>
                  {i.nombre}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {loading && (
        <div className={styles.stateBox}>
          <Spinner size="lg" aria-label="Buscando matches" />
        </div>
      )}

      {!loading && sinPerfil && (
        <EmptyState
          icon="🎸"
          title={error}
          description="Con tu comarca y tus estilos podemos sugerirte gente y sitios que encajan contigo."
          action={
            <Button to="/perfil" variant="primary" size="sm">
              Crear mi perfil
            </Button>
          }
        />
      )}

      {!loading && error && !sinPerfil && (
        <EmptyState icon="⚠️" title="No se pudo cargar" description={error} />
      )}

      {!loading && !error && matches.length === 0 && (
        <EmptyState
          icon="🔍"
          title="Todavía no hay matches para esta búsqueda"
          description="Prueba otra opción o completa tu comarca y tus estilos en Mi perfil."
        />
      )}

      {!loading && !error && matches.length > 0 && (
        <div className={styles.grid}>
          {matches.map((m) => (
            <MatchCard key={m.perfil_id} match={m} />
          ))}
        </div>
      )}
    </main>
  );
}
