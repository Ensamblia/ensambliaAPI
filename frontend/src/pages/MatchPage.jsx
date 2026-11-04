// src/pages/MatchPage.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import api, { extractList, parseApiError } from '@/api/axios';
import { getMatches } from '@/api/match';
import { MatchCard } from '@/components/match/MatchCard';
import { AnuncioMatchCard } from '@/components/match/AnuncioMatchCard';
import { Sparkles } from 'lucide-react';
import { PerfilContext } from '@/context/PerfilContext';
import { Avatar, Button, EmptyState, PageHeader, Select, Spinner } from '@/components/ui';
import { OPCIONES_BUSCO, puntuacionMatch } from '@/utils/match';
import styles from './MatchPage.module.css';

// Posiciones (en %) de las órbitas alrededor de "Tú"
const ORBITAS = [
  { top: 10, left: 72 },
  { top: 26, left: 8 },
  { top: 68, left: 86 },
  { top: 86, left: 30 },
];

function HeroMatch({ matches }) {
  const { me } = useContext(PerfilContext);
  const mejores = [...matches].sort((a, b) => puntuacionMatch(b) - puntuacionMatch(a));
  const top = mejores[0];
  const yo = [me?.nombre, me?.apellido].filter(Boolean).join(' ');

  return (
    <section className={styles.hero}>
      <div className={styles.heroTexto}>
        <h2>
          La química
          <br />
          también suena.
        </h2>
        <p>
          Cruzamos tus estilos, tu zona y lo que tocas con el resto de la comunidad. Cuanto más completo tu
          perfil, mejores sugerencias.
        </p>
        {top && (
          <p className={styles.heroMejor}>
            Mejor coincidencia ahora mismo:{' '}
            <strong>
              {top.nombre} · {puntuacionMatch(top)}%
            </strong>
          </p>
        )}
      </div>
      <div className={styles.orbita} aria-hidden="true">
        <span className={styles.anillo1} />
        <span className={styles.anillo2} />
        <span className={styles.yo}>
          <Avatar name={yo} src={me?.foto_url} size="sm" />
          Tú
        </span>
        {mejores.slice(0, ORBITAS.length).map((m, i) => (
          <span key={m.perfil_id} className={styles.satelite} style={ORBITAS[i]}>
            <Avatar name={[m.nombre, m.apellido].filter(Boolean).join(' ')} size="md" />
            <span className={styles.porcentaje}>{puntuacionMatch(m)}%</span>
          </span>
        ))}
      </div>
    </section>
  );
}

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
        title="Match inteligente"
        icon={<Sparkles size={22} />}
        tone="navy"
        subtitle="Personas con las que tienes más probabilidades de sonar bien, ordenadas por compatibilidad."
      />

      <HeroMatch matches={busco === 'anuncios' ? [] : matches} />

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
              onClick={() => {
                if (o.value === busco) return;
                // Vaciar ya: perfiles y anuncios se pintan con tarjetas distintas
                setMatches([]);
                setLoading(true);
                setBusco(o.value);
              }}
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
          {matches.map((m) =>
            busco === 'anuncios' ? (
              <AnuncioMatchCard key={m.anuncio_id} anuncio={m} />
            ) : (
              <MatchCard key={m.perfil_id} match={m} />
            ),
          )}
        </div>
      )}
    </main>
  );
}
