import React, { useEffect, useState } from 'react';
import api, { extractList } from '../../api/axios';

/* ── Styles ── */
const wrapper = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  padding: '20px 0',
  borderBottom: '1px solid #EBEBEB',
  marginBottom: '28px',
};

const baseInput = {
  padding: '9px 14px',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  color: '#0F0F0F',
  backgroundColor: '#FAFAFA',
  transition: 'border-color 140ms ease, box-shadow 140ms ease, background 140ms ease',
  outline: 'none',
};

const searchInput = {
  ...baseInput,
  flex: '1 1 260px',
  minWidth: '220px',
};

const selectInput = {
  ...baseInput,
  flex: '0 1 170px',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A8A8A' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
};

const focusStyles = {
  borderColor: '#FF5C35',
  boxShadow: '0 0 0 3px rgba(255,92,53,0.10)',
  backgroundColor: '#FFFFFF',
};

const blurStyles = {
  borderColor: '#EBEBEB',
  boxShadow: 'none',
  backgroundColor: '#FAFAFA',
};

const addFocus = (e) => Object.assign(e.target.style, focusStyles);
const removeFocus = (e) => Object.assign(e.target.style, blurStyles);

const CLEAR_BTN = {
  padding: '9px 14px',
  borderRadius: '8px',
  border: '1px solid #EBEBEB',
  backgroundColor: 'transparent',
  color: '#8A8A8A',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'border-color 140ms ease, color 140ms ease',
};

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
    return () => { cancelado = true; };
  }, []);

  // Emitir cambios al padre (con todo el estado junto)
  useEffect(() => {
    if (!onFilter) return;
    onFilter({
      busqueda,
      tipo_anuncio: tipoAnuncioId,
      ordering,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, tipoAnuncioId, ordering]);

  const limpiar = () => {
    setBusqueda('');
    setTipoAnuncioId('');
    setOrdering('-fecha_publicacion');
  };

  const hayFiltrosActivos =
    busqueda.trim() !== '' ||
    tipoAnuncioId !== '' ||
    ordering !== '-fecha_publicacion';

  return (
    <div style={wrapper}>
      <input
        type="text"
        placeholder="Buscar por título o contenido…"
        style={searchInput}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        onFocus={addFocus}
        onBlur={removeFocus}
      />

      <select
        style={selectInput}
        value={tipoAnuncioId}
        onChange={(e) => setTipoAnuncioId(e.target.value)}
        onFocus={addFocus}
        onBlur={removeFocus}
        disabled={loadingTipos}
      >
        <option value="">
          {loadingTipos ? 'Cargando…' : 'Todos los tipos'}
        </option>
        {tipos.map((t) => (
          <option key={t.tipo_anuncio_id} value={t.tipo_anuncio_id}>
            {t.tipo}
          </option>
        ))}
      </select>

      <select
        style={selectInput}
        value={ordering}
        onChange={(e) => setOrdering(e.target.value)}
        onFocus={addFocus}
        onBlur={removeFocus}
      >
        <option value="-fecha_publicacion">Más recientes</option>
        <option value="fecha_publicacion">Más antiguos</option>
        <option value="titulo">Título A→Z</option>
        <option value="-titulo">Título Z→A</option>
      </select>

      {hayFiltrosActivos && (
        <button
          type="button"
          style={CLEAR_BTN}
          onClick={limpiar}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#D0D0D0';
            e.currentTarget.style.color = '#2B2B2B';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#EBEBEB';
            e.currentTarget.style.color = '#8A8A8A';
          }}
          title="Limpiar filtros"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}