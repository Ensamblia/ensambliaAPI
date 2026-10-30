// src/pages/PerfilPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import api, { parseApiError } from '@/api/axios';
import { FileUploader } from '@/components/multimedia/FileUploader';
import { MediaGallery } from '@/components/multimedia/MediaGallery';
import { MisAnuncios } from '@/components/anuncios/MisAnuncios';
import { PerfilContext } from '@/context/PerfilContext';
import { uploadFile } from '@/api/multimedia';
import { DatosLocalForm } from '@/components/locales/DatosLocalForm';
import { ArtistasSugeridos } from '@/components/locales/ArtistasSugeridos';

import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Field,
  Input,
  SectionLabel,
  Select,
  Tag,
  Textarea,
} from '@/components/ui';
import {
  TIPOS_PERFIL,
  etiquetaTipoPerfil,
  llevaApellido,
} from '@/utils/tipoPerfil';
import styles from './PerfilPage.module.css';

const emptyForm = {
  nombre: '',
  apellido: '',
  correo: '',
  descripcion: '',
  testimonio: '',
  comarcaTexto: '',
  tipo: 'usuario',
};

export function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [perfilId, setPerfilId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [comarcas, setComarcas] = useState([]);
  const [instrumentos, setInstrumentos] = useState([]);
  const [generos, setGeneros] = useState([]);

  const [instrSelected, setInstrSelected] = useState(new Set());
  const [genSelected, setGenSelected] = useState(new Set());
  const [instrOriginal, setInstrOriginal] = useState(new Set());
  const [genOriginal, setGenOriginal] = useState(new Set());

  const [bibliotecaRefresh, setBibliotecaRefresh] = useState(0);
  const [anunciosRefresh] = useState(0);
  const [localRefresh, setLocalRefresh] = useState(0);

  const { me, refresh: refreshMe } = useContext(PerfilContext);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const [comarcasRes, instrumentosRes, generosRes] = await Promise.all([
          api.get('/comarcas').catch(() => ({ data: [] })),
          api.get('/instrumentos').catch(() => ({ data: [] })),
          api.get('/genero_musical').catch(() => ({ data: [] })),
        ]);
        if (cancelado) return;
        setComarcas(comarcasRes.data);
        setInstrumentos(instrumentosRes.data);
        setGeneros(generosRes.data);

        let perfil = null;
        try {
          const perfilRes = await api.get('/perfiles/me');
          perfil = perfilRes.data;
        } catch (err) {
          if (err.response?.status !== 404) throw err;
        }
        if (cancelado) return;

        if (perfil) {
          const comarca = comarcasRes.data.find(
            (c) => c.comarca_id === perfil.comarca_id,
          );
          setPerfilId(perfil.perfil_id);
          setForm({
            nombre: perfil.nombre || '',
            apellido: perfil.apellido || '',
            correo: perfil.correo || '',
            descripcion: perfil.descripcion || '',
            testimonio: perfil.testimonio || '',
            comarcaTexto: comarca ? comarca.nombre : '',
            tipo: perfil.tipo || 'usuario',
          });

          const [instrRes, genRes] = await Promise.all([
            api
              .get('/perfil-instrumentos/perfil', {
                params: { perfil_id: perfil.perfil_id },
              })
              .catch(() => ({ data: [] })),
            api
              .get('/perfil-genero-musicales/perfil', {
                params: { perfil_id: perfil.perfil_id },
              })
              .catch(() => ({ data: [] })),
          ]);
          if (cancelado) return;
          const instrSet = new Set(instrRes.data.map((r) => r.instrumento_id));
          const genSet = new Set(genRes.data.map((r) => r.genero_id));
          setInstrSelected(instrSet);
          setInstrOriginal(instrSet);
          setGenSelected(genSet);
          setGenOriginal(genSet);
        } else {
          setPerfilId(null);
          setForm(emptyForm);
        }
      } catch (err) {
        if (!cancelado) {
          setErrorMsg(
            parseApiError(err, 'No se pudo cargar tu perfil. Inténtalo de nuevo.'),
          );
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);
  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !perfilId) return;
    try {
      // 1. Presigned
      const presignedRes = await api.post('/perfiles/presigned-avatar/', {
        nombre: file.name,
        content_type: file.type || 'application/octet-stream',
        tamano_bytes: file.size,
      });
      const { upload_url, object_key } = presignedRes.data;

      // 2. PUT a MinIO con x-amz-acl
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', upload_url, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('x-amz-acl', 'public-read');
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Error al subir: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Error de red al subir'));
        xhr.send(file);
      });

      // 3. set-avatar
      await api.post(`/perfiles/${perfilId}/set-avatar/`, { object_key });

      // 4. Refrescar me
      refreshMe();
      setSuccessMsg('Foto actualizada.');
    } catch (err) {
      setErrorMsg('No se pudo subir la foto. Inténtalo de nuevo.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const toggleInstr = (id) => {
    setInstrSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleGen = (id) => {
    setGenSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resolverComarcaId = () => {
    const texto = form.comarcaTexto.trim();
    if (!texto) return { comarca_id: null, ok: true };
    const match = comarcas.find(
      (c) => c.nombre.toLowerCase() === texto.toLowerCase(),
    );
    if (!match) return { comarca_id: null, ok: false };
    return { comarca_id: match.comarca_id, ok: true };
  };

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    const conApellido = llevaApellido(form.tipo);
    if (
      !form.nombre.trim() ||
      (conApellido && !form.apellido.trim()) ||
      !form.correo.trim() ||
      !form.descripcion.trim()
    ) {
      setErrorMsg(
        conApellido
          ? 'Nombre, apellido, correo y descripción son obligatorios.'
          : 'Nombre, correo y descripción son obligatorios.',
      );
      return;
    }

    const { comarca_id, ok } = resolverComarcaId();
    if (!ok) {
      setErrorMsg('Esa comarca no existe. Elige una de la lista de sugerencias.');
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      apellido: conApellido ? form.apellido.trim() : '',
      correo: form.correo.trim(),
      descripcion: form.descripcion.trim(),
      testimonio: form.testimonio.trim() || null,
      comarca_id,
    };

    setSaving(true);
    try {
      let currentPerfilId = perfilId;

      if (currentPerfilId) {
        await api.put(`/perfiles/${currentPerfilId}`, payload);
      } else {
        // El tipo solo se elige al crear; el backend no deja cambiarlo después
        const res = await api.post('/perfiles', { ...payload, tipo: form.tipo });
        currentPerfilId = res.data.perfil_id;
        setPerfilId(currentPerfilId);
      }

      // Un local no tiene instrumentos: no se tocan sus instrumentos al guardar
      const esLocal = form.tipo === 'local';
      const instrAdded = esLocal ? [] : [...instrSelected].filter((id) => !instrOriginal.has(id));
      const instrRemoved = esLocal ? [] : [...instrOriginal].filter((id) => !instrSelected.has(id));
      const genAdded = [...genSelected].filter((id) => !genOriginal.has(id));
      const genRemoved = [...genOriginal].filter((id) => !genSelected.has(id));

      await Promise.all([
        ...instrAdded.map((id) =>
          api.post('/perfil-instrumentos', {
            perfil_id: currentPerfilId,
            instrumento_id: id,
          }),
        ),
        ...instrRemoved.map((id) =>
          api.delete(`/perfil-instrumentos/${currentPerfilId}/${id}`),
        ),
        ...genAdded.map((id) =>
          api.post('/perfil-genero-musicales', {
            perfil_id: currentPerfilId,
            genero_id: id,
          }),
        ),
        ...genRemoved.map((id) =>
          api.delete(`/perfil-genero-musicales/${currentPerfilId}/${id}`),
        ),
      ]);

      setInstrOriginal(new Set(instrSelected));
      setGenOriginal(new Set(genSelected));
      setSuccessMsg('Perfil guardado correctamente.');
    } catch (err) {
      setErrorMsg(
        parseApiError(err, 'No se pudo guardar el perfil. Inténtalo de nuevo.'),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.sectionSubtitle}>Cargando tu perfil…</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <SectionLabel tone="yellow">MI PERFIL</SectionLabel>

      {!perfilId && (
        <p className={styles.noticeBanner}>
          Aún no has creado tu perfil. Elige si eres músico, grupo o local,
          rellena el formulario y guarda para crearlo.
        </p>
      )}
      {errorMsg && <p className={styles.errorBanner}>{errorMsg}</p>}
      {successMsg && <p className={styles.successBanner}>{successMsg}</p>}

      <div className={styles.layout}>
        {/* ── Columna izquierda: cabecera + formulario ── */}
        <aside className={styles.sidebar}>
          <div className={styles.profileHeader}>
            {me?.foto_url ? (
              <img src={me.foto_url} alt="Foto de perfil" className={styles.avatarImg} />) : (
                <div className={styles.avatar}>🎸</div>
              )}
            <button
              type="button"
              className={styles.cambiarFotoBtn}
              onClick={() => document.getElementById('foto-input')?.click()}>
              Cambiar foto
            </button>
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFotoChange}
            />
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>
                {form.nombre || form.apellido
                  ? `${form.nombre} ${form.apellido}`.trim()
                  : 'Nuevo perfil'}
              </p>
              <span className={styles.profileHandle}>
                {form.comarcaTexto || 'Sin comarca'}
              </span>
              {perfilId && (
                <Tag color="coral" size="sm">
                  {etiquetaTipoPerfil(form.tipo)}
                </Tag>
              )}
            </div>
          </div>

          <Card className={styles.card} padding="none">
            <div className={styles.section}>
              <SectionLabel tone="blue">INFORMACIÓN BÁSICA</SectionLabel>

              {!perfilId && (
                <Field
                  label="Tipo de perfil"
                  hint={
                    form.tipo === 'local'
                      ? 'Guarda el perfil y después podrás añadir los datos del local.'
                      : ''
                  }
                >
                  <Select value={form.tipo} onChange={handleChange('tipo')}>
                    {TIPOS_PERFIL.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              <div className={styles.fieldRow}>
                <Field
                  label={
                    llevaApellido(form.tipo)
                      ? 'Nombre'
                      : `Nombre del ${etiquetaTipoPerfil(form.tipo).toLowerCase()}`
                  }
                >
                  <Input
                    value={form.nombre}
                    onChange={handleChange('nombre')}
                  />
                </Field>
                {llevaApellido(form.tipo) && (
                  <Field label="Apellido">
                    <Input
                      value={form.apellido}
                      onChange={handleChange('apellido')}
                    />
                  </Field>
                )}
              </div>

              <Field label="Correo">
                <Input
                  type="email"
                  value={form.correo}
                  onChange={handleChange('correo')}
                />
              </Field>

              <Field label="Descripción">
                <Textarea
                  placeholder="Cuéntanos sobre ti como músico…"
                  value={form.descripcion}
                  onChange={handleChange('descripcion')}
                />
              </Field>

              <Field
                label="Tu testimonio sobre Ensamblia"
                hint="Se muestra en el landing (opcional, mín. 40 caracteres).">
                <Textarea
                  placeholder="¿Qué te ha aportado Ensamblia?"
                  value={form.testimonio}
                  onChange={handleChange('testimonio')}
                  maxLength={500}/>
              </Field>

<Field label="Comarca" hint="Empieza a escribir para ver sugerencias">
  <Input
    list="comarcas-list"
    placeholder="Escribe tu comarca…"
    value={form.comarcaTexto}
    onChange={handleChange('comarcaTexto')}
  />
</Field>
<datalist id="comarcas-list">
  {comarcas.map((c) => (
    <option key={c.comarca_id} value={c.nombre} />
  ))}
</datalist>
            </div>

            {form.tipo !== 'local' && (
            <div className={styles.section}>
              <SectionLabel tone="green">INSTRUMENTOS</SectionLabel>
              <div className={styles.tagRow}>
                {instrumentos.map((inst) => {
                  const active = instrSelected.has(inst.instrumento_id);
                  return (
                    <button
                      key={inst.instrumento_id}
                      type="button"
                      className={[
                        styles.tagBtn,
                        active ? styles.tagBtnActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleInstr(inst.instrumento_id)}
                    >
                      {inst.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            <div className={`${styles.section} ${styles.sectionLast}`}>
              <SectionLabel tone="purple">GÉNEROS MUSICALES</SectionLabel>
              <div className={styles.tagRow}>
                {generos.map((g) => {
                  const active = genSelected.has(g.genero_musical_id);
                  return (
                    <button
                      key={g.genero_musical_id}
                      type="button"
                      className={[
                        styles.tagBtn,
                        active ? styles.tagBtnActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleGen(g.genero_musical_id)}
                    >
                      {g.nombre}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.actionsBar}>
              <Button
                variant="primary"
                size="md"
                block
                onClick={handleSave}
                loading={saving}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </Card>
        </aside>

        {/* ── Columna derecha: biblioteca + anuncios ── */}
        <section className={styles.content}>
          {perfilId && form.tipo === 'local' && (
            <>
              <Card className={styles.contentCard}>
                <ArtistasSugeridos perfilId={perfilId} refreshKey={localRefresh} />
              </Card>
              <Card className={styles.contentCard}>
                <DatosLocalForm perfilId={perfilId} onSaved={() => setLocalRefresh((k) => k + 1)} />
              </Card>
            </>
          )}

          <Card className={styles.contentCard}>
            <SectionLabel tone="coral">MI BIBLIOTECA</SectionLabel>
            <p className={styles.sectionSubtitle}>
              Sube fotos, audios, vídeos o PDFs. Podrás usarlos en tus anuncios
              y mensajes sin volver a subirlos.
            </p>

            {perfilId ? (
              <>
                <FileUploader
                  onUploaded={() => setBibliotecaRefresh((k) => k + 1)}
                />
                <div className={styles.mediaWrapper}>
                  <MediaGallery
                    perfilId={perfilId}
                    refreshKey={bibliotecaRefresh}
                  />
                </div>
              </>
            ) : (
              <p className={styles.noticeBanner}>
                Guarda tu perfil primero para poder subir archivos.
              </p>
            )}
          </Card>

          <Card className={styles.contentCard}>
            <div className={styles.sectionHeaderRow}>
              <SectionLabel tone="yellow">MIS ANUNCIOS</SectionLabel>
              <Link to="/anuncios/crear" className={styles.linkAction}>
                + Crear anuncio
              </Link>
            </div>
            <p className={styles.sectionSubtitle}>
              Aquí puedes ver todos tus anuncios y gestionar su multimedia.
            </p>

            {perfilId ? (
              <MisAnuncios perfilId={perfilId} refreshKey={anunciosRefresh} />
            ) : (
              <p className={styles.noticeBanner}>
                Guarda tu perfil primero para ver tus anuncios.
              </p>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}