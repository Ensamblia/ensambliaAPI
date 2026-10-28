// src/components/match/BusquedaAnuncioInfo.jsx
import React, { useContext, useEffect, useState } from 'react';
import { getBusquedaAnuncio, getCandidatosAnuncio } from '@/api/match';
import { AuthContext } from '@/context/AuthContext';
import { SectionLabel, Tag } from '@/components/ui';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import { MatchCard } from './MatchCard';
import styles from './BusquedaAnuncioInfo.module.css';

// Qué busca un anuncio y, si eres su autor, qué perfiles encajan con él.
export function BusquedaAnuncioInfo({ anuncioId }) {
  const { user } = useContext(AuthContext);
  const [busqueda, setBusqueda] = useState(null);
  const [candidatos, setCandidatos] = useState(null);

  useEffect(() => {
    let cancelado = false;
    getBusquedaAnuncio(anuncioId)
      .then((data) => {
        if (!cancelado) setBusqueda(data);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [anuncioId]);

  useEffect(() => {
    if (!user) {
      setCandidatos(null);
      return undefined;
    }
    let cancelado = false;
    // Solo responde al autor del anuncio; a cualquier otro le devuelve 403 y no se muestra nada
    getCandidatosAnuncio(anuncioId, { limit: 6 })
      .then((data) => {
        if (!cancelado) setCandidatos(data.results ?? []);
      })
      .catch(() => {
        if (!cancelado) setCandidatos(null);
      });
    return () => {
      cancelado = true;
    };
  }, [anuncioId, user]);

  const etiquetas = [];
  if (busqueda?.tipo_perfil) etiquetas.push(etiquetaTipoPerfil(busqueda.tipo_perfil));
  if (busqueda?.instrumento) etiquetas.push(busqueda.instrumento);
  (busqueda?.generos ?? []).forEach((g) => etiquetas.push(g.nombre));

  return (
    <>
      {etiquetas.length > 0 && (
        <div className={styles.busca}>
          <SectionLabel tone="green">Busca</SectionLabel>
          <div className={styles.tags}>
            {etiquetas.map((e) => (
              <Tag key={e} color="green">
                {e}
              </Tag>
            ))}
          </div>
          {busqueda.inferida && <span className={styles.nota}>Deducido del texto del anuncio</span>}
        </div>
      )}

      {candidatos && (
        <section className={styles.candidatos}>
          <SectionLabel tone="coral">Perfiles que encajan con tu anuncio</SectionLabel>
          {candidatos.length === 0 ? (
            <p className={styles.nota}>
              Todavía no hay perfiles que encajen. Indicar qué buscas (instrumento, estilos) ayuda a encontrarlos.
            </p>
          ) : (
            <div className={styles.grid}>
              {candidatos.map((c) => (
                <MatchCard key={c.perfil_id} match={c} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
