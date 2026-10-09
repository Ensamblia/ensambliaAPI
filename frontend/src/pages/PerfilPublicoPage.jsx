import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { getPerfilPublico } from '../api/perfiles';
import { AuthContext } from '../context/AuthContext';

const page = { maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px' };

const profileHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  padding: '28px',
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  marginBottom: '20px',
  backgroundColor: '#FAFAFA',
};

const avatarCircle = {
  width: '68px',
  height: '68px',
  borderRadius: '50%',
  backgroundColor: '#0F0F0F',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.6rem',
  flexShrink: 0,
};

const profileInfo = { display: 'flex', flexDirection: 'column', gap: '4px' };

const profileName = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
  margin: 0,
};

const profileHandle = { fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#8A8A8A' };

const formCard = { border: '1px solid #EBEBEB', borderRadius: '12px', overflow: 'hidden' };
const formSection = { padding: '24px 28px', borderBottom: '1px solid #EBEBEB' };
const formSectionLast = { padding: '24px 28px' };

const sectionTitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  color: '#D4D4D4',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '16px',
};

const bodyText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#2B2B2B',
  lineHeight: 1.6,
  margin: 0,
};

const tagRow = { display: 'flex', flexWrap: 'wrap', gap: '6px' };

const tagBase = {
  padding: '5px 12px',
  borderRadius: '999px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  border: '1px solid #EBEBEB',
  color: '#555555',
  backgroundColor: '#FFFFFF',
};

const actionsBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '10px',
  padding: '16px 28px',
  borderTop: '1px solid #EBEBEB',
  backgroundColor: '#FAFAFA',
};

const btnContactar = {
  padding: '9px 22px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  borderRadius: '7px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '13.5px',
  letterSpacing: '-0.01em',
  border: 'none',
  cursor: 'pointer',
};

const btnContactarDisabled = { ...btnContactar, backgroundColor: '#F2B3A2', cursor: 'not-allowed' };

const noticeBanner = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A6D00',
  backgroundColor: '#FFF8E1',
  border: '1px solid #F2E2A0',
  borderRadius: '8px',
  padding: '10px 14px',
  marginBottom: '20px',
};

const errorBanner = { ...noticeBanner, color: '#B3261E', backgroundColor: '#FDECEA', border: '1px solid #F5C6C2' };

const stateBox = {
  padding: '56px 0',
  textAlign: 'center',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#8A8A8A',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
};

const editLink = { color: '#FF5C35', fontWeight: 600, textDecoration: 'none' };

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
        const [comarcasRes, instrumentosRes, generosRes, instrRes, genRes] = await Promise.all([
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
      } catch {
        if (!cancelado) setErrorMsg('No se pudo cargar toda la información del perfil.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => { cancelado = true; };
  }, [id]);

  useEffect(() => {
    if (!user) {
      setMiPerfilId(null);
      return;
    }
    api.get('/perfiles/me')
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
        setContactarError(err.response.data?.error || 'No puedes contactar contigo mismo.');
      } else {
        setContactarError('No se pudo iniciar la conversación.');
      }
    } finally {
      setContactando(false);
    }
  };

  if (loading) {
    return (
      <main style={page}>
        <div style={stateBox}>
          <span style={{ fontSize: '2rem' }}>⏳</span>
          <span>Cargando perfil…</span>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main style={page}>
        <div style={stateBox}>
          <span style={{ fontSize: '2rem' }}>🔍</span>
          <span>Este perfil no existe o fue eliminado.</span>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '24px', color: '#0F0F0F' }}>
        Perfil de músico
      </h1>

      {errorMsg && <p style={errorBanner}>{errorMsg}</p>}
      {contactarError && <p style={errorBanner}>{contactarError}</p>}

      <div style={profileHeader}>
        <div style={avatarCircle}>🎸</div>
        <div style={profileInfo}>
          <p style={profileName}>{perfil.nombre} {perfil.apellido}</p>
          <span style={profileHandle}>{comarcaNombre || 'Sin comarca'}</span>
        </div>
      </div>

      <div style={formCard}>
        <div style={formSection}>
          <p style={sectionTitle}>Descripción</p>
          <p style={bodyText}>{perfil.descripcion || 'Sin descripción.'}</p>
        </div>

        <div style={formSection}>
          <p style={sectionTitle}>Instrumentos</p>
          <div style={tagRow}>
            {instrumentos.length === 0 && <span style={bodyText}>Sin instrumentos indicados.</span>}
            {instrumentos.map((inst) => (
              <span key={inst.instrumento_id} style={tagBase}>{inst.nombre}</span>
            ))}
          </div>
        </div>

        <div style={formSectionLast}>
          <p style={sectionTitle}>Géneros musicales</p>
          <div style={tagRow}>
            {generos.length === 0 && <span style={bodyText}>Sin géneros indicados.</span>}
            {generos.map((g) => (
              <span key={g.genero_musical_id} style={tagBase}>{g.nombre}</span>
            ))}
          </div>
        </div>

        <div style={actionsBar}>
          {esMiPerfil ? (
            <>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#8A8A8A' }}>Este es tu perfil</span>
              <Link to="/perfil" style={editLink}>Editarlo</Link>
            </>
          ) : (
            <button
              type="button"
              disabled={contactando}
              style={contactando ? btnContactarDisabled : btnContactar}
              onClick={handleContactar}
            >
              {contactando ? 'Contactando…' : 'Contactar'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
