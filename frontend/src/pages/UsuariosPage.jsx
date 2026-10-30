import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiltrosUsuarios } from '@/components/usuarios/FiltrosUsuarios';
import { Avatar, EmptyState, PageHeader, Spinner } from '@/components/ui';
import api, { extractList } from '@/api/axios';
import anunciosStyles from './AnunciosPage.module.css';
import styles from './UsuariosPage.module.css';

const nombreDe = (p) => [p.nombre, p.apellido].filter(Boolean).join(' ');

const coincide = (p, f, instrumentosPorPerfil, generosPorPerfil) => {
  if (f.search && !nombreDe(p).toLowerCase().includes(f.search.trim().toLowerCase())) return false;
  if (f.comarca && String(p.comarca_id) !== f.comarca) return false;
  if (f.instrumento && !(instrumentosPorPerfil[p.perfil_id] ?? []).includes(f.instrumento)) return false;
  if (f.genero && !(generosPorPerfil[p.perfil_id] ?? []).includes(f.genero)) return false;
  return true;
};

export function UsuariosPage() {
  const [perfiles, setPerfiles] = useState([]);
  const [instrumentosPorPerfil, setInstrumentosPorPerfil] = useState({});
  const [generosPorPerfil, setGenerosPorPerfil] = useState({});
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/perfiles', { params: { limit: 1000 } }),
      api.get('/perfil-instrumentos/').then(extractList).catch(() => []),
      api.get('/perfil-genero-musicales/').then(extractList).catch(() => []),
    ])
      .then(([resPerfiles, parejasInstrumentos, parejasGeneros]) => {
        setPerfiles(resPerfiles.data?.results ?? extractList(resPerfiles));

        const mapaInstrumentos = {};
        parejasInstrumentos.forEach(({ perfil_id, instrumento_id }) => {
          mapaInstrumentos[perfil_id] = [...(mapaInstrumentos[perfil_id] ?? []), String(instrumento_id)];
        });
        setInstrumentosPorPerfil(mapaInstrumentos);

        const mapaGeneros = {};
        parejasGeneros.forEach(({ perfil_id, genero_id }) => {
          mapaGeneros[perfil_id] = [...(mapaGeneros[perfil_id] ?? []), String(genero_id)];
        });
        setGenerosPorPerfil(mapaGeneros);
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = useCallback((nuevos) => setFiltros(nuevos), []);

  const resultados = perfiles.filter((p) =>
    coincide(p, filtros, instrumentosPorPerfil, generosPorPerfil)
  );

  return (
    <main className={anunciosStyles.page}>
      <PageHeader
        title="Usuarios"
        actions={
          !loading && !error ? (
            <span className={anunciosStyles.countBadge}>
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </span>
          ) : null
        }
      />

      <FiltrosUsuarios onFilter={handleFilter} />

      {loading && (
        <div className={anunciosStyles.stateBox}>
          <Spinner size="lg" aria-label="Cargando usuarios" />
        </div>
      )}

      {!loading && error && (
        <EmptyState icon="⚠️" title="No se pudo cargar" description={error} />
      )}

      {!loading && !error && resultados.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No hay usuarios con esos filtros"
          description="Prueba con otro nombre, otra comarca, otro instrumento u otro género."
        />
      )}

      {!loading && !error && resultados.length > 0 && (
        <div className={anunciosStyles.grid}>
          {resultados.map((p) => (
            <Link key={p.perfil_id} to={`/perfiles/${p.perfil_id}`} className={styles.card}>
              <Avatar name={nombreDe(p)} src={p.foto_url} size="md" />
              <span className={styles.name}>{nombreDe(p)}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}