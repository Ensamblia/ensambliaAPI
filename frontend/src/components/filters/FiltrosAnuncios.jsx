// src/components/filters/FiltrosAnuncios.jsx
import React, { useEffect, useState } from 'react';
import api, { extractList } from '@/api/axios';
import { Button, Input, Select } from '@/components/ui';
import { PanelFiltros } from './PanelFiltros';
import styles from './FiltrosAnuncios.module.css';

export function FiltrosAnuncios({ onFilter, initialValues = {} }) {
  const [busqueda, setBusqueda] = useState(initialValues.busqueda || '');
  const [tipoAnuncioId, setTipoAnuncioId] = useState(initialValues.tipo_anuncio || '');
  const [ordering, setOrdering] = useState(initialValues.ordering || '-fecha_publicacion');

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // Cargar tipos de anuncio
  useEffect(() => {
    let cancelado = false;
    api
      .get('/tipo-anuncios/')
      .then((res) => {
        if (cancelado) return;
        setTipos(extractList(res));
      })
      .catch(() => {
        if (cancelado) return;
        setTipos([]);
      })
      .finally(() => {
        if (!cancelado) setLoadingTipos(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Emitir cambios al padre con todo el estado junto
  useEffect(() => {
    if (!onFilter) return;
    onFilter({ busqueda, tipo_anuncio: tipoAnuncioId, ordering });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, tipoAnuncioId, ordering]);

  const limpiar = () => {
    setBusqueda('');
    setTipoAnuncioId('');
    setOrdering('-fecha_publicacion');
  };

  // Los que quedan dentro del panel plegable (la búsqueda siempre se ve)
  const activosEnPanel = [tipoAnuncioId !== '', ordering !== '-fecha_publicacion'].filter(Boolean).length;
  const hayFiltrosActivos = busqueda.trim() !== '' || activosEnPanel > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.search}>
        <Input
          type="search"
          placeholder="Buscar por título o contenido…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar anuncios"
        />
      </div>

      <PanelFiltros activos={activosEnPanel}>
        <div className={styles.select}>
          <Select
            value={tipoAnuncioId}
            onChange={(e) => setTipoAnuncioId(e.target.value)}
            disabled={loadingTipos}
            aria-label="Filtrar por tipo de anuncio"
          >
            <option value="">
              {loadingTipos ? 'Cargando…' : 'Todos los tipos'}
            </option>
            {tipos.map((t) => (
              <option key={t.tipo_anuncio_id} value={t.tipo_anuncio_id}>
                {t.tipo}
              </option>
            ))}
          </Select>
        </div>

        <div className={styles.select}>
          <Select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            aria-label="Ordenar anuncios"
          >
            <option value="-fecha_publicacion">Más recientes</option>
            <option value="fecha_publicacion">Más antiguos</option>
            <option value="titulo">Título A→Z</option>
            <option value="-titulo">Título Z→A</option>
          </Select>
        </div>
      </PanelFiltros>

      {hayFiltrosActivos && (
        <Button
          variant="ghost"
          size="sm"
          onClick={limpiar}
          className={styles.clear}
        >
          Limpiar
        </Button>
      )}
    </div>
  );
}