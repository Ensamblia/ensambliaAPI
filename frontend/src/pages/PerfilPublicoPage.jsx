// src/pages/PerfilPublicoPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { parseApiError } from '@/api/axios';
import { getPerfilPublico } from '@/api/perfiles';
import { AuthContext } from '@/context/AuthContext';
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  SectionLabel,
  Spinner,
  Tag,
} from '@/components/ui';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import styles from './PerfilPublicoPage.module.css';

export function PerfilPublicoPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [comarcaNombre, setComarcaNombre] = useState('');
  const [instrumentos, setInstrumentos] = useState([]);
  const [generos, setGeneros] = useState([]);

  const [miPerfilId, setMiPerfilId] = useState(null);
  const [contactando, setContactando] = useState(false);
  const [contactarError, setContactarError] = useState('');

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      setNotFound(false);
      setErrorMsg('');

      const data = await getPerfilPublico(id);
      if (cancelado) return;

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPerfil(data);

      try {
        const [comarcasRes, instrumentosRes, generosRes, instrRes, genRes] =
          await Promise.all([
            api.get('/comarcas').catch(() => ({ data: [] })),
            api.get('/instrumentos').catch(() => ({ data: [] })),
            api.get('/genero_musical').catch(() => ({ data: [] })),
            api
              .get('/perfil-instrumentos/perfil', { params: { perfil_id: id } })
              .catch(() => ({ data: [] })),
            api
              .get('/perfil-genero-musicales/perfil', { params: { perfil_id: id } })
              .catch(() => ({ data: [] })),
          ]);
        if (cancelado) return;

        const comarca = comarcasRes.data.find(
          (c) => c.comarca_id === data.comarca_id,
        );
        setComarcaNombre(comarca ? comarca.nombre : '');

        const instrIds = new Set(instrRes.data.map((r) => r.instrumento_id));
        setInstrumentos(
          instrumentosRes.data.filter((i) => instrIds.has(i.instrumento_id)),
        );

        const genIds = new Set(genRes.data.map((r) => r.genero_id));
        setGeneros(
          generosRes.data.filter((g) => genIds.has(g.genero_musical_id)),
        );
      } catch (err) {
        if (!cancelado) {
          setErrorMsg(
            parseApiError(
              err,
              'No se pudo cargar toda la información del perfil.',
            ),
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
  }, [id]);

  useEffect(() => {
    if (!user) {
      setMiPerfilId(null);
      return;
    }
    api
      .get('/perfiles/me')
      .then((res) => setMiPerfilId(res.data.perfil_id))
      .catch(() => setMiPerfilId(null));
  }, [user]);

  const esMiPerfil = miPerfilId !== null && Number(id) === miPerfilId;

  const handleContactar = async () => {
    setContactarError('');
    setContactando(true);
    try {
      const res = await api.post(`/chats/con/${id}`);
      navigate(`/chat?chat=${res.data.chat_id}`);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        setContactarError('Necesitas crear tu perfil antes de contactar.');
      } else if (err.response?.status === 400) {
        setContactarError(
          err.response.data?.error || 'No puedes contactar contigo mismo.',
        );
      } else {
        setContactarError('No se pudo iniciar la conversación.');
      }
    } finally {
      setContactando(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.stateBox}>
          <Spinner size="lg" aria-label="Cargando perfil" />
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className={styles.page}>
        <PageHeader title="Perfil de músico" backTo="/anuncios" backLabel="Anuncios" />
        <EmptyState
          icon="🔍"
          title="Este perfil no existe"
          description="Puede que se haya eliminado o que la URL sea incorrecta."
        />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <PageHeader
        title={
          perfil.tipo && perfil.tipo !== 'usuario'
            ? `Perfil de ${etiquetaTipoPerfil(perfil.tipo).toLowerCase()}`
            : 'Perfil de músico'
        }
        backTo="/anuncios"
        backLabel="Anuncios"
      />

      {errorMsg && <p className={styles.errorBanner}>{errorMsg}</p>}
      {contactarError && <p className={styles.errorBanner}>{contactarError}</p>}

      <div className={styles.profileHeader}>
        <div className={styles.avatar}>🎸</div>
        <div className={styles.profileInfo}>
          <p className={styles.profileName}>
            {perfil.nombre} {perfil.apellido}
          </p>
          <span className={styles.profileHandle}>
            {comarcaNombre || 'Sin comarca'}
          </span>
          <Tag color="coral" size="sm">
            {etiquetaTipoPerfil(perfil.tipo)}
          </Tag>
        </div>
      </div>

      <Card className={styles.card} padding="none">
        <div className={styles.section}>
          <SectionLabel tone="blue">DESCRIPCIÓN</SectionLabel>
          <p className={styles.bodyText}>
            {perfil.descripcion || 'Sin descripción.'}
          </p>
        </div>

        <div className={styles.section}>
          <SectionLabel tone="green">INSTRUMENTOS</SectionLabel>
          <div className={styles.tagRow}>
            {instrumentos.length === 0 && (
              <span className={styles.bodyText}>Sin instrumentos indicados.</span>
            )}
            {instrumentos.map((inst) => (
              <Tag key={inst.instrumento_id} color="green">
                {inst.nombre}
              </Tag>
            ))}
          </div>
        </div>

        <div className={`${styles.section} ${styles.sectionLast}`}>
          <SectionLabel tone="purple">GÉNEROS MUSICALES</SectionLabel>
          <div className={styles.tagRow}>
            {generos.length === 0 && (
              <span className={styles.bodyText}>Sin géneros indicados.</span>
            )}
            {generos.map((g) => (
              <Tag key={g.genero_musical_id} color="purple">
                {g.nombre}
              </Tag>
            ))}
          </div>
        </div>

        <div className={styles.actionsBar}>
          {esMiPerfil ? (
            <>
              <span className={styles.myProfileNote}>Este es tu perfil</span>
              <Button to="/perfil" variant="primary" size="sm">
                Editarlo
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleContactar}
              loading={contactando}
            >
              {contactando ? 'Contactando…' : 'Contactar'}
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}