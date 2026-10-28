// src/components/locales/DatosLocalForm.jsx
import React, { useEffect, useState } from 'react';
import api, { extractList, parseApiError } from '@/api/axios';
import { getLocal, guardarLocal } from '@/api/locales';
import { Button, Field, Input, Select, SectionLabel } from '@/components/ui';
import { TIPOS_LOCAL } from '@/utils/tipoLocal';
import styles from './DatosLocalForm.module.css';

const VACIO = { ciudad_id: '', direccion: '', aforo: '', tipos: [] };

export function DatosLocalForm({ perfilId, onSaved }) {
  const [form, setForm] = useState(VACIO);
  const [ciudades, setCiudades] = useState([]);
  const [tieneDatos, setTieneDatos] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      getLocal(perfilId).catch(() => null),
      api.get('/ciudades/').then(extractList).catch(() => []),
    ]).then(([perfilLocal, listaCiudades]) => {
      if (cancelado) return;
      setCiudades(listaCiudades);
      const local = perfilLocal?.local;
      setTieneDatos(Boolean(local));
      if (local) {
        setForm({
          ciudad_id: String(local.ciudad_id),
          direccion: local.direccion,
          aforo: local.aforo == null ? '' : String(local.aforo),
          tipos: local.tipos,
        });
      }
      setLoading(false);
    });
    return () => {
      cancelado = true;
    };
  }, [perfilId]);

  const handleChange = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
  };

  const toggleTipo = (tipo) => {
    setForm((f) => ({
      ...f,
      tipos: f.tipos.includes(tipo) ? f.tipos.filter((t) => t !== tipo) : [...f.tipos, tipo],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    setSaving(true);
    try {
      // Mismo orden que TIPOS_LOCAL, da igual en qué orden se marcaron
      const tipos = TIPOS_LOCAL.map((t) => t.value).filter((v) => form.tipos.includes(v));
      const data = await guardarLocal(perfilId, {
        ciudad_id: form.ciudad_id === '' ? null : Number(form.ciudad_id),
        direccion: form.direccion,
        aforo: form.aforo === '' ? null : Number(form.aforo),
        tipos,
      });
      setTieneDatos(true);
      setOk('Datos del local guardados');
      onSaved?.(data);
    } catch (err) {
      setError(parseApiError(err, 'No se pudieron guardar los datos del local.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <SectionLabel tone="coral">DATOS DEL LOCAL</SectionLabel>

      {!tieneDatos && (
        <p className={styles.aviso}>
          Completa los datos de tu local para aparecer en búsquedas.
        </p>
      )}

      <Field label="Ciudad" required>
        <Select value={form.ciudad_id} onChange={handleChange('ciudad_id')}>
          <option value="">Elige una ciudad</option>
          {ciudades.map((c) => (
            <option key={c.ciudad_id} value={c.ciudad_id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Dirección" required>
        <Input value={form.direccion} onChange={handleChange('direccion')} maxLength={150} />
      </Field>

      <Field label="Aforo" hint="Número de personas. Déjalo vacío si no aplica.">
        <Input
          type="number"
          min={1}
          max={100000}
          value={form.aforo}
          onChange={handleChange('aforo')}
        />
      </Field>

      <fieldset className={styles.tipos}>
        <legend className={styles.legend}>Tipo de local</legend>
        {TIPOS_LOCAL.map((t) => (
          <label key={t.value} className={styles.tipo}>
            <input
              type="checkbox"
              checked={form.tipos.includes(t.value)}
              onChange={() => toggleTipo(t.value)}
            />
            {t.label}
          </label>
        ))}
      </fieldset>

      {error && <p className={styles.error}>{error}</p>}
      {ok && <p className={styles.ok}>{ok}</p>}

      <div>
        <Button type="submit" variant="primary" size="sm" loading={saving}>
          Guardar datos del local
        </Button>
      </div>
    </form>
  );
}
