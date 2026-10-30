// src/components/match/QueBuscasFields.jsx
import React, { useEffect, useState } from 'react';
import api, { extractList } from '@/api/axios';
import { Field, Select } from '@/components/ui';
import { TIPOS_PERFIL } from '@/utils/tipoPerfil';
import styles from './QueBuscasFields.module.css';

// Bloque opcional "¿Qué buscas?" del formulario de anuncio. Controlado: value + onChange.
export function QueBuscasFields({ value, onChange }) {
  const [instrumentos, setInstrumentos] = useState([]);
  const [generos, setGeneros] = useState([]);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      api.get('/instrumentos/').then(extractList).catch(() => []),
      api.get('/genero_musical/').then(extractList).catch(() => []),
    ]).then(([listaInstrumentos, listaGeneros]) => {
      if (cancelado) return;
      setInstrumentos(listaInstrumentos);
      setGeneros(listaGeneros);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  const set = (campo) => (e) => onChange({ ...value, [campo]: e.target.value });
  // Un local no toca instrumentos: al buscar un local se quita el instrumento
  const setTipoPerfil = (e) =>
    onChange({
      ...value,
      tipo_perfil: e.target.value,
      ...(e.target.value === 'local' ? { instrumento_id: '' } : {}),
    });

  const toggleGenero = (id) =>
    onChange({
      ...value,
      generos: value.generos.includes(id) ? value.generos.filter((g) => g !== id) : [...value.generos, id],
    });

  return (
    <fieldset className={styles.bloque}>
      <legend className={styles.titulo}>¿Qué buscas? (opcional)</legend>
      <p className={styles.ayuda}>
        Si lo indicas, tu anuncio aparecerá a quien encaje y podrás ver qué perfiles encajan con él.
      </p>

      <div className={styles.fila}>
        <Field label="Qué tipo de perfil buscas">
          <Select value={value.tipo_perfil} onChange={setTipoPerfil}>
            <option value="">Cualquiera</option>
            {TIPOS_PERFIL.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        {value.tipo_perfil !== 'local' && (
        <Field label="Instrumento que buscas">
          <Select value={value.instrumento_id} onChange={set('instrumento_id')}>
            <option value="">Ninguno en concreto</option>
            {instrumentos.map((i) => (
              <option key={i.instrumento_id} value={i.instrumento_id}>
                {i.nombre}
              </option>
            ))}
          </Select>
        </Field>
        )}
      </div>

      {generos.length > 0 && (
        <div className={styles.estilos} role="group" aria-label="Estilos que buscas">
          <span className={styles.etiqueta}>Estilos</span>
          {generos.map((g) => (
            <label key={g.genero_musical_id} className={styles.estilo}>
              <input
                type="checkbox"
                checked={value.generos.includes(g.genero_musical_id)}
                onChange={() => toggleGenero(g.genero_musical_id)}
              />
              {g.nombre}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
