// src/pages/CrearEventoPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { extractList, parseApiError } from '@/api/axios';
import { crearEvento, misPerfiles } from '@/api/eventos';
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from '@/components/ui';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import styles from './CrearAnuncioPage.module.css';
import propios from './CrearEventoPage.module.css';

export function CrearEventoPage() {
  const navigate = useNavigate();
  const [perfiles, setPerfiles] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [form, setForm] = useState({
    perfil_id: '', titulo: '', fecha: '', hora: '', local_id: '', lugar: '', ciudad_id: '',
    generos: [], precio: '', descripcion: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      misPerfiles().catch(() => []),
      api.get('/ciudades/').then(extractList).catch(() => []),
      api.get('/genero_musical/').then(extractList).catch(() => []),
    ]).then(([listaPerfiles, listaCiudades, listaGeneros]) => {
      setPerfiles(listaPerfiles);
      setCiudades(listaCiudades);
      setGeneros(listaGeneros);
      const porDefecto = listaPerfiles.find((p) => p.tipo === 'usuario') ?? listaPerfiles[0];
      if (porDefecto) setForm((f) => ({ ...f, perfil_id: String(porDefecto.perfil_id) }));
    });
  }, []);

  // Solo se puede enlazar un local propio (el backend lo exige)
  const misLocales = perfiles.filter((p) => p.tipo === 'local');

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const toggleGenero = (id) =>
    setForm((f) => ({
      ...f,
      generos: f.generos.includes(id) ? f.generos.filter((g) => g !== id) : [...f.generos, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.titulo.trim()) return setError('El título es obligatorio.');
    if (!form.fecha || !form.hora) return setError('Indica la fecha y la hora del evento.');
    if (!form.local_id && !form.ciudad_id) return setError('Elige la ciudad o un local de Ensamblia.');

    const payload = {
      titulo: form.titulo.trim(),
      fecha_inicio: new Date(`${form.fecha}T${form.hora}`).toISOString(),
      generos: form.generos,
      precio: form.precio.trim(),
      descripcion: form.descripcion.trim(),
    };
    if (form.perfil_id) payload.perfil_id = Number(form.perfil_id);
    if (form.local_id) payload.local_id = Number(form.local_id);
    else {
      payload.ciudad_id = Number(form.ciudad_id);
      payload.lugar = form.lugar.trim();
    }

    setSaving(true);
    try {
      const evento = await crearEvento(payload);
      navigate(`/eventos/${evento.evento_id}`);
    } catch (err) {
      setError(parseApiError(err, 'No se pudo publicar el evento.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <PageHeader title="Publicar evento" backTo="/eventos" backLabel="Eventos" />

      {error && <p className={styles.error}>{error}</p>}

      <Card className={styles.formCard} padding="none">
        <form onSubmit={handleSubmit}>
          <div className={propios.campos}>
            {perfiles.length > 1 && (
              <Field label="Publicar como">
                <Select value={form.perfil_id} onChange={set('perfil_id')}>
                  {perfiles.map((p) => (
                    <option key={p.perfil_id} value={p.perfil_id}>
                      {[p.nombre, p.apellido].filter(Boolean).join(' ')} ({etiquetaTipoPerfil(p.tipo)})
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field label="Título" required>
              <Input value={form.titulo} onChange={set('titulo')} maxLength={120} placeholder="Concierto de otoño" />
            </Field>

            <div className={propios.fila}>
              <Field label="Fecha" required>
                <Input type="date" value={form.fecha} onChange={set('fecha')} />
              </Field>
              <Field label="Hora" required>
                <Input type="time" value={form.hora} onChange={set('hora')} />
              </Field>
            </div>

            {misLocales.length > 0 && (
              <Field label="Local de Ensamblia" hint="Uno de tus locales. Si es en otro sitio, déjalo vacío.">
                <Select value={form.local_id} onChange={set('local_id')}>
                  <option value="">Ninguno (otro sitio)</option>
                  {misLocales.map((p) => (
                    <option key={p.perfil_id} value={p.perfil_id}>
                      {p.nombre}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            {!form.local_id && (
              <div className={propios.fila}>
                <Field label="Ciudad" required>
                  <Select value={form.ciudad_id} onChange={set('ciudad_id')}>
                    <option value="">Elige una ciudad</option>
                    {ciudades.map((c) => (
                      <option key={c.ciudad_id} value={c.ciudad_id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Lugar" hint="Sala, bar, plaza…">
                  <Input value={form.lugar} onChange={set('lugar')} maxLength={150} />
                </Field>
              </div>
            )}

            {generos.length > 0 && (
              <fieldset className={propios.estilos}>
                <legend className={propios.legend}>Estilos</legend>
                {generos.map((g) => (
                  <label key={g.genero_musical_id} className={propios.estilo}>
                    <input
                      type="checkbox"
                      checked={form.generos.includes(g.genero_musical_id)}
                      onChange={() => toggleGenero(g.genero_musical_id)}
                    />
                    {g.nombre}
                  </label>
                ))}
              </fieldset>
            )}

            <Field label="Precio" hint="Por ejemplo: Gratis, 10 €, taquilla inversa">
              <Input value={form.precio} onChange={set('precio')} maxLength={50} />
            </Field>

            <Field label="Descripción">
              <Textarea value={form.descripcion} onChange={set('descripcion')} maxLength={1000} />
            </Field>
          </div>

          <div className={styles.actionsBar}>
            <Button variant="secondary" size="md" onClick={() => navigate('/eventos')}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              {saving ? 'Publicando…' : 'Publicar evento'}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
