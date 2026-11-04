import React, { useEffect, useState } from 'react';
import api, { extractList } from '@/api/axios';
import { Button, Input, Select } from '@/components/ui';
import styles from './FiltrosUsuarios.module.css';

const INICIAL = { search: '', comarca: '', instrumento: '', genero: '' };

export function FiltrosUsuarios({ onFilter }) {
  const [filtros, setFiltros] = useState(INICIAL);
  const [comarcas, setComarcas] = useState([]);
  const [instrumentos, setInstrumentos] = useState([]);
  const [generos, setGeneros] = useState([]);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      api.get('/comarcas/').then(extractList).catch(() => []),
      api.get('/instrumentos/').then(extractList).catch(() => []),
      api.get('/genero_musical/').then(extractList).catch(() => []),
    ]).then(([listaComarcas, listaInstrumentos, listaGeneros]) => {
      if (cancelado) return;
      setComarcas(listaComarcas);
      setInstrumentos(listaInstrumentos);
      setGeneros(listaGeneros);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    onFilter?.(filtros);
  }, [filtros]);

  const set = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const hayFiltrosActivos = Object.values(filtros).some((v) => v !== '');

  return (
    <div className={styles.wrapper}>
      <div className={styles.search}>
        <Input
          type="search"
          placeholder="Buscar por nombre…"
          value={filtros.search}
          onChange={set('search')}
          aria-label="Buscar usuarios"
        />
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
        <Select
          value={filtros.instrumento}
          onChange={set('instrumento')}
          aria-label="Filtrar por instrumento"
        >
          <option value="">Todos los instrumentos</option>
          {instrumentos.map((i) => (
            <option key={i.instrumento_id} value={i.instrumento_id}>
              {i.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.select}>
        <Select
          value={filtros.genero}
          onChange={set('genero')}
          aria-label="Filtrar por género musical"
        >
          <option value="">Todos los géneros</option>
          {generos.map((g) => (
            <option key={g.genero_musical_id} value={g.genero_musical_id}>
              {g.nombre}
            </option>
          ))}
        </Select>
      </div>

      {hayFiltrosActivos && (
        <Button variant="ghost" size="sm" onClick={() => setFiltros(INICIAL)} className={styles.clear}>
          Limpiar
        </Button>
      )}
    </div>
  );
}