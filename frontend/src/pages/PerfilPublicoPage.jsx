import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { parseApiError } from '@/api/axios';
import { getPerfilPublico } from '@/api/perfiles';
import { AuthContext } from '@/context/AuthContext';
import {
  Button, Card, EmptyState, PageHeader, SectionLabel, Spinner, Tag,
} from '@/components/ui';
import { etiquetaTipoPerfil } from '@/utils/tipoPerfil';
import { DatosLocalInfo } from '@/components/locales/DatosLocalInfo';
import { ProximosEventos } from '@/components/eventos/ProximosEventos';
import {
  getMiembrosGrupo, solicitarUnirse, cancelarSolicitud,
} from '@/api/grupos';
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

  // Grupos
  const [miembros, setMiembros] = useState([]);
  const [miSolicitud, setMiSolicitud] = useState(null);
  const [grupoAccion, setGrupoAccion] = useState('');

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
            api.get('/perfil-instrumentos/perfil', { params: { perfil_id: id } }).catch(() => ({ data: [] })),
            api.get('/perfil-genero-musicales/perfil', { params: { perfil_id: id } }).catch(() => ({ data: [] })),
          ]);
        if (cancelado) return;

        const comarca = comarcasRes.data.find((c) => c.comarca_id === data.comarca_id);
        setComarcaNombre(comarca ? comarca.nombre : '');

        const instrIds = new Set(instrRes.data.map((r) => r.instrumento_id));
        setInstrumentos(instrumentosRes.data.filter((i) => instrIds.has(i.instrumento_id)));

        const genIds = new Set(genRes.data.map((r) => r.genero_id));
        setGeneros(generosRes.data.filter((g) => genIds.has(g.genero_musical_id)));
      } catch (err) {
        if (!cancelado) {
          setErrorMsg(parseApiError(err, 'No se pudo cargar toda la información del perfil.'));
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => { cancelado = true; };
  }, [id]);

  useEffect(() => {
    if (!user) { setMiPerfilId(null); return; }
    api.get('/perfiles/me')
      .then((res) => setMiPerfilId(res.data.perfil_id))
      .catch(() => setMiPerfilId(null));
  }, [user]);

  // Miembros del grupo (solo si es grupo)
  useEffect(() => {
    if (!perfil || perfil.tipo !== 'grupo') return;
    let cancelado = false;
    getMiembrosGrupo(id)
      .then((ms) => { if (!cancelado) setMiembros(ms); })
      .catch(() => { if (!cancelado) setMiembros([]); });
    return () => { cancelado = true; };
  }, [perfil, id]);

  const esMiPerfil = miPerfilId !== null && Number(id) === miPerfilId;

  const handleContactar = async () => {
    setContactarError('');
    setContactando(true);
    try {
      const res = await api.post(`/chats/con/${id}`);
      navigate(`/chat?chat=${res.data.chat_id}`);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else if (err.response?.status === 403) setContactarError('Necesitas crear tu perfil antes de contactar.');
      else if (err.response?.status === 400) setContactarError(err.response.data?.error || 'No puedes contactar contigo mismo.');
      else setContactarError('No se pudo iniciar la conversación.');
    } finally {
      setContactando(false);
    }
  };

  const handleSolicitar = async () => {
    setGrupoAccion('');
    try {
      const sol = await solicitarUnirse(id);
      setMiSolicitud(sol);
    } catch (err) {
      setGrupoAccion(err.response?.data?.error || 'No se pudo enviar la solicitud.');
    }
  };

  const handleCancelar = async () => {
    if (!miSolicitud) return;
    setGrupoAccion('');
    try {
      await cancelarSolicitud(miSolicitud.solicitud_id);
      setMiSolicitud(null);
    } catch {
      setGrupoAccion('No se pudo cancelar la solicitud.');
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
        <EmptyState icon="🔍" title="Este perfil no existe" description="Puede que se haya eliminado o que la URL sea incorrecta." />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <PageHeader
        title={perfil.tipo && perfil.tipo !== 'usuario'
          ? `Perfil de ${etiquetaTipoPerfil(perfil.tipo).toLowerCase()}`
          : 'Perfil de músico'}
        backTo="/anuncios"
        backLabel="Anuncios"
      />

      {errorMsg && <p className={styles.errorBanner}>{errorMsg}</p>}
      {contactarError && <p className={styles.errorBanner}>{contactarError}</p>}

      <div className={styles.profileHeader}>
        {perfil.foto_url ? (
          <img src={perfil.foto_url} alt={`Foto de ${perfil.nombre}`} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatar}>🎸</div>
        )}
        <div className={styles.profileInfo}>
          <p className={styles.profileName}>{perfil.nombre} {perfil.apellido}</p>
          <span className={styles.profileHandle}>{comarcaNombre || 'Sin comarca'}</span>
          <Tag color="coral" size="sm">{etiquetaTipoPerfil(perfil.tipo)}</Tag>
        </div>
      </div>

      <Card className={styles.card} padding="none">
        <div className={styles.section}>
          <SectionLabel tone="blue">DESCRIPCIÓN</SectionLabel>
          <p className={styles.bodyText}>{perfil.descripcion || 'Sin descripción.'}</p>
        </div>

        {perfil.tipo === 'local' && (
          <DatosLocalInfo perfilId={id} className={styles.section} />
        )}

        <ProximosEventos perfilId={id} className={styles.section} />

        {perfil.tipo === 'grupo' && (
          <div className={styles.section}>
            <SectionLabel tone="coral">MIEMBROS ({miembros.length})</SectionLabel>
            <div className={styles.tagRow}>
              {miembros.length === 0 && <span className={styles.bodyText}>Todavía no hay miembros.</span>}
              {miembros.map((m) => (
                <Tag key={m.perfil_id} color="coral">{`Perfil #${m.perfil_id}`}</Tag>
              ))}
            </div>
            {!esMiPerfil && user && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                {miSolicitud ? (
                  <>
                    <Tag color="yellow">Solicitud pendiente</Tag>
                    <Button variant="secondary" size="sm" onClick={handleCancelar}>Cancelar solicitud</Button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleSolicitar}>Solicitar unirme</Button>
                )}
              </div>
            )}
            {grupoAccion && <p className={styles.errorBanner} style={{ marginTop: 8 }}>{grupoAccion}</p>}
            {esMiPerfil && (
              <Button
                to={`/grupos/${id}/solicitudes`}
                variant="secondary"
                size="sm"
                style={{ marginTop: 12 }}
              >
                Gestionar solicitudes
              </Button>
            )}
          </div>
        )}

        <div className={styles.section}>
          <SectionLabel tone="green">INSTRUMENTOS</SectionLabel>
          <div className={styles.tagRow}>
            {instrumentos.length === 0 && <span className={styles.bodyText}>Sin instrumentos indicados.</span>}
            {instrumentos.map((inst) => (
              <Tag key={inst.instrumento_id} color="green">{inst.nombre}</Tag>
            ))}
          </div>
        </div>

        <div className={`${styles.section} ${styles.sectionLast}`}>
          <SectionLabel tone="purple">GÉNEROS MUSICALES</SectionLabel>
          <div className={styles.tagRow}>
            {generos.length === 0 && <span className={styles.bodyText}>Sin géneros indicados.</span>}
            {generos.map((g) => (
              <Tag key={g.genero_musical_id} color="purple">{g.nombre}</Tag>
            ))}
          </div>
        </div>

        <div className={styles.actionsBar}>
          {esMiPerfil ? (
            <>
              <span className={styles.myProfileNote}>Este es tu perfil</span>
              <Button to="/perfil" variant="primary" size="sm">Editarlo</Button>
            </>
          ) : (
            <Button variant="primary" size="md" onClick={handleContactar} loading={contactando}>
              {contactando ? 'Contactando…' : 'Contactar'}
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}