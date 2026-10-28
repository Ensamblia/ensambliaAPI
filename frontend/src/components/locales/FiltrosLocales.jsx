// src/components/locales/FiltrosLocales.jsx
import React, { useEffect, useState } from 'react';
import api, { extractList } from '@/api/axios';
import { Button, Input, Select } from '@/components/ui';
import styles from './FiltrosLocales.module.css';

const INICIAL = { uso: '', comarca: '', aforo_min: '', genero: '', search: '' };

export function FiltrosLocales({ onFilter }) {
  const [filtros, setFiltros] = useState(INICIAL);
  const [comarcas, setComarcas] = useState([]);
  const [generos, setGeneros] = useState([]);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      api.get('/comarcas/').then(extractList).catch(() => []),
      api.get('/genero_musical/').then(extractList).catch(() => []),
    ]).then(([listaComarcas, listaGeneros]) => {
      if (cancelado) return;
      setComarcas(listaComarcas);
      setGeneros(listaGeneros);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  // Emitir cambios al padre con todo el estado junto
  useEffect(() => {
    onFilter?.(filtros);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const set = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const hayFiltrosActivos = Object.values(filtros).some((v) => v !== '');

  return (
    <div className={styles.wrapper}>
      <div className={styles.search}>
        <Input
          type="search"
          placeholder="Buscar por nombre o descripción…"
          value={filtros.search}
          onChange={set('search')}
          aria-label="Buscar locales"
        />
      </div>

      <div className={styles.select}>
        <Select value={filtros.uso} onChange={set('uso')} aria-label="Para qué buscas local">
          <option value="">Ensayar o tocar</option>
          <option value="ensayar">Ensayar</option>
          <option value="tocar">Tocar en directo</option>
        </Select>
      </div>

      <div className={styles.select}>
        <Select value={filtros.comarca} onChange={set('comarca')} aria-label="Filtrar por comarca">
          <option value="">Todas las comarcas</option>
          {comarcas.map((c) => (
            <option key={c.comarca_id} value={c.comarca_id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.select}>
        <Select value={filtros.genero} onChange={set('genero')} aria-label="Filtrar por estilo">
          <option value="">Todos los estilos</option>
          {generos.map((g) => (
            <option key={g.genero_musical_id} value={g.genero_musical_id}>
              {g.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.aforo}>
        <Input
          type="number"
          min={1}
          placeholder="Aforo mínimo"
          value={filtros.aforo_min}
          onChange={set('aforo_min')}
          aria-label="Aforo mínimo"
        />
      </div>

      {hayFiltrosActivos && (
        <Button variant="ghost" size="sm" onClick={() => setFiltros(INICIAL)} className={styles.clear}>
          Limpiar
        </Button>
      )}
    </div>
  );
}
