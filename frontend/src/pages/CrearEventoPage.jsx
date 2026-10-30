// src/pages/CrearEventoPage.jsx
// Publicar un evento (/eventos/crear) o editarlo (/eventos/:id/editar, solo el autor).
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { extractList, parseApiError } from '@/api/axios';
import { crearEvento, editarEvento, getEvento, misPerfiles } from '@/api/eventos';
import { Button, Card, EmptyState, Field, Input, PageHeader, Select, Spinner, Textarea } from '@/components/ui';
import { fechaYHoraInputs } from '@/utils/eventos';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import styles from './CrearAnuncioPage.module.css';
import propios from './CrearEventoPage.module.css';

export function CrearEventoPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const [perfiles, setPerfiles] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [form, setForm] = useState({
    perfil_id: '', titulo: '', fecha: '', hora: '', local_id: '', lugar: '', ciudad_id: '',
    generos: [], precio: '', descripcion: '',
  });
  // cargando | ok | no-autor | no-existe | error (los cuatro primeros, solo al editar)
  const [estado, setEstado] = useState(editando ? 'cargando' : 'ok');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      misPerfiles().catch(() => []),
      api.get('/ciudades/').then(extractList).catch(() => []),
      api.get('/genero_musical/').then(extractList).catch(() => []),
      editando ? getEvento(id) : null,
    ])
      .then(([listaPerfiles, listaCiudades, listaGeneros, evento]) => {
        if (cancelado) return;
        setPerfiles(listaPerfiles);
        setCiudades(listaCiudades);
        setGeneros(listaGeneros);
        if (!evento) {
          const porDefecto = listaPerfiles.find((p) => p.tipo === 'usuario') ?? listaPerfiles[0];
          if (porDefecto) setForm((f) => ({ ...f, perfil_id: String(porDefecto.perfil_id) }));
          return;
        }
        if (!listaPerfiles.some((p) => p.perfil_id === evento.autor.perfil_id)) {
          setEstado('no-autor');
          return;
        }
        setForm({
          perfil_id: String(evento.autor.perfil_id),
          titulo: evento.titulo,
          ...fechaYHoraInputs(evento.fecha_inicio),
          local_id: evento.local ? String(evento.local.perfil_id) : '',
          lugar: evento.lugar ?? '',
          ciudad_id: evento.ciudad_id ? String(evento.ciudad_id) : '',
          generos: evento.generos.map((g) => g.genero_musical_id),
          precio: evento.precio ?? '',
          descripcion: evento.descripcion ?? '',
        });
        setEstado('ok');
      })
      .catch((err) => {
        if (!cancelado) setEstado(err.response?.status === 404 ? 'no-existe' : 'error');
      });
    return () => {
      cancelado = true;
    };
  }, [editando, id]);

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
    if (form.perfil_id && !editando) payload.perfil_id = Number(form.perfil_id);
    if (form.local_id) {
      payload.local_id = Number(form.local_id);
      // Al editar, el PUT es parcial: si pasa a un local, se borra el lugar anterior
      if (editando) payload.lugar = '';
    } else {
      if (editando) payload.local_id = null;
      payload.ciudad_id = Number(form.ciudad_id);
      payload.lugar = form.lugar.trim();
    }

    setSaving(true);
    try {
      if (editando) {
        await editarEvento(id, payload);
        navigate(`/eventos/${id}`);
      } else {
        const evento = await crearEvento(payload);
        navigate(`/eventos/${evento.evento_id}`);
      }
    } catch (err) {
      setError(parseApiError(err, editando ? 'No se pudieron guardar los cambios.' : 'No se pudo publicar el evento.'));
    } finally {
      setSaving(false);
    }
  };

  const volverA = editando ? `/eventos/${id}` : '/eventos';
  const titulo = editando ? 'Editar evento' : 'Publicar evento';

  if (estado === 'cargando') {
    return (
      <main className={styles.page}>
        <PageHeader title={titulo} backTo={volverA} backLabel="Evento" />
        <Spinner size="lg" aria-label="Cargando evento" />
      </main>
    );
  }

  if (estado !== 'ok') {
    const mensajes = {
      'no-autor': ['Solo quien publicó el evento puede editarlo', 'Entra con la cuenta que lo publicó.'],
      'no-existe': ['Este evento no existe', 'Puede que se haya borrado o que la dirección no sea correcta.'],
      error: ['No se pudo cargar el evento', 'Inténtalo de nuevo en un momento.'],
    };
    const [tituloVacio, descripcion] = mensajes[estado];
    return (
      <main className={styles.page}>
        <PageHeader title={titulo} backTo={volverA} backLabel="Evento" />
        <EmptyState icon="📅" title={tituloVacio} description={descripcion} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <PageHeader title={titulo} backTo={volverA} backLabel={editando ? 'Evento' : 'Eventos'} />

      {error && <p className={styles.error}>{error}</p>}

      <Card className={styles.formCard} padding="none">
        <form onSubmit={handleSubmit}>
          <div className={propios.campos}>
            {/* El autor no se puede cambiar al editar */}
            {!editando && perfiles.length > 1 && (
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
            <Button variant="secondary" size="md" onClick={() => navigate(volverA)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              {editando ? (saving ? 'Guardando…' : 'Guardar cambios') : saving ? 'Publicando…' : 'Publicar evento'}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
