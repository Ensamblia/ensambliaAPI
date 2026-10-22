// src/pages/CrearAnuncioPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { parseApiError } from '@/api/axios';
import { EditarMediosModal } from '@/components/multimedia/EditarMediosModal';
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '@/components/ui';
import styles from './CrearAnuncioPage.module.css';

export function CrearAnuncioPage() {
  const navigate = useNavigate();

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipoId, setTipoId] = useState('');

  const [creadoAnuncio, setCreadoAnuncio] = useState(null);

  useEffect(() => {
    api
      .get('/tipo-anuncios/')
      .then((res) => {
        const lista = res.data?.results ?? res.data ?? [];
        setTipos(lista);
        if (lista.length > 0) setTipoId(String(lista[0].tipo_anuncio_id));
      })
      .catch(() => setTipos([]))
      .finally(() => setLoadingTipos(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (titulo.trim().length < 3) {
      setError('El título debe tener al menos 3 caracteres.');
      return;
    }
    if (!contenido.trim() || contenido.trim().length < 10) {
      setError('El contenido debe tener al menos 10 caracteres.');
      return;
    }
    if (!tipoId) {
      setError('Selecciona un tipo de anuncio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        tipo_anuncio_id: Number(tipoId),
      };
      const res = await api.post('/anuncios/', payload);
      setCreadoAnuncio(res.data);
    } catch (err) {
      setError(
        parseApiError(err, 'No se pudo crear el anuncio. Inténtalo de nuevo.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCerrarModal = () => {
    const idFinal = creadoAnuncio?.anuncio_id;
    setCreadoAnuncio(null);
    if (idFinal) {
      navigate(`/anuncios/${idFinal}`);
    }
  };

  return (
    <main className={styles.page}>
      <PageHeader
        title="Crear anuncio"
        backTo="/perfil"
        backLabel="Mi perfil"
      />

      {error && <p className={styles.error}>{error}</p>}

      <Card className={styles.formCard} padding="none">
        <form onSubmit={handleSubmit}>
          <div className={styles.section}>
            <Field label="Título" required>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={160}
                placeholder="Ej: Busco batería para grupo de rock"
              />
            </Field>

            <Field label="Tipo de anuncio" required>
              <Select
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                disabled={loadingTipos}
              >
                {loadingTipos && <option>Cargando…</option>}
                {!loadingTipos && tipos.length === 0 && (
                  <option value="">Sin tipos disponibles</option>
                )}
                {tipos.map((t) => (
                  <option key={t.tipo_anuncio_id} value={t.tipo_anuncio_id}>
                    {t.tipo}
                  </option>
                ))}
              </Select>
            </Field>

<Field label="Contenido" required>
  <Textarea
    value={contenido}
    onChange={(e) => setContenido(e.target.value)}
    maxLength={750}
    placeholder="Describe lo que buscas, ofreces o vendes…"
  />
</Field>
<span className={styles.counter}>{contenido.length} / 750</span>
          </div>

          <div className={styles.actionsBar}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/perfil')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
            >
              {saving ? 'Publicando…' : 'Publicar anuncio'}
            </Button>
          </div>
        </form>
      </Card>

      {creadoAnuncio && (
        <EditarMediosModal
          anuncio={creadoAnuncio}
          perfilId={creadoAnuncio.perfil_id}
          onClose={handleCerrarModal}
          onSaved={handleCerrarModal}
        />
      )}
    </main>
  );
}