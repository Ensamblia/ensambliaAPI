import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { EditarMediosModal } from '../components/multimedia/EditarMediosModal';

/* ── Styles ── */
const page = {
  maxWidth: '640px',
  margin: '0 auto',
  padding: '48px 24px 80px',
};

const backLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#8A8A8A',
  textDecoration: 'none',
  marginBottom: '24px',
};

const title = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.5rem',
  fontWeight: 800,
  letterSpacing: '-0.04em',
  marginBottom: '24px',
  color: '#0F0F0F',
};

const formCard = {
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  overflow: 'hidden',
};

const formSection = {
  padding: '24px 28px',
  borderBottom: '1px solid #EBEBEB',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  marginBottom: '16px',
};

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: '#2B2B2B',
  letterSpacing: '-0.01em',
};

const inputStyle = {
  padding: '9px 13px',
  border: '1px solid #EBEBEB',
  borderRadius: '7px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#0F0F0F',
  backgroundColor: '#FAFAFA',
  outline: 'none',
  transition: 'border-color 140ms ease, box-shadow 140ms ease, background 140ms ease',
  width: '100%',
  boxSizing: 'border-box',
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '140px',
  lineHeight: 1.6,
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

const actionsBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '10px',
  padding: '16px 28px',
  backgroundColor: '#FAFAFA',
};

const btnSecondary = {
  padding: '9px 20px',
  backgroundColor: 'transparent',
  color: '#555555',
  border: '1px solid #EBEBEB',
  borderRadius: '7px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
};

const btnSave = {
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
  transition: 'background 140ms ease',
};

const btnSaveDisabled = {
  ...btnSave,
  backgroundColor: '#F2B3A2',
  cursor: 'not-allowed',
};

const errorBanner = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#B3261E',
  backgroundColor: '#FDECEA',
  border: '1px solid #F5C6C2',
  borderRadius: '8px',
  padding: '10px 14px',
  marginBottom: '16px',
};

const addFocusStyles = (e) => {
  e.target.style.borderColor = '#FF5C35';
  e.target.style.boxShadow = '0 0 0 3px rgba(255,92,53,0.10)';
  e.target.style.backgroundColor = '#FFFFFF';
};
const removeFocusStyles = (e) => {
  e.target.style.borderColor = '#EBEBEB';
  e.target.style.boxShadow = 'none';
  e.target.style.backgroundColor = '#FAFAFA';
};

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

  // Cargar tipos de anuncio
  useEffect(() => {
    api.get('/tipo-anuncios/')
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
      const anuncio = res.data;

      // Abrimos el modal de multimedia antes de navegar
      setCreadoAnuncio(anuncio);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'No se pudo crear el anuncio. Inténtalo de nuevo.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCerrarModal = (guardado) => {
    const idFinal = creadoAnuncio?.anuncio_id;
    setCreadoAnuncio(null);
    if (idFinal) {
      navigate(`/anuncios/${idFinal}`);
    }
  };

  return (
    <main style={page}>
      <Link to="/perfil" style={backLink}>← Volver a mi perfil</Link>

      <h1 style={title}>Crear anuncio</h1>

      {error && <p style={errorBanner}>{error}</p>}

      <form style={formCard} onSubmit={handleSubmit}>
        <div style={formSection}>
          <div style={fieldGroup}>
            <label style={labelStyle}>Título *</label>
            <input
              style={inputStyle}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onFocus={addFocusStyles}
              onBlur={removeFocusStyles}
              maxLength={160}
              placeholder="Ej: Busco batería para grupo de rock"
            />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Tipo de anuncio *</label>
            <select
              style={selectStyle}
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              onFocus={addFocusStyles}
              onBlur={removeFocusStyles}
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
            </select>
          </div>

          <div style={{ ...fieldGroup, marginBottom: 0 }}>
            <label style={labelStyle}>Contenido *</label>
            <textarea
              style={textareaStyle}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              onFocus={addFocusStyles}
              onBlur={removeFocusStyles}
              maxLength={750}
              placeholder="Describe lo que buscas, ofreces o vendes…"
            />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11.5px',
              color: '#D4D4D4',
              textAlign: 'right',
            }}>
              {contenido.length} / 750
            </span>
          </div>
        </div>

        <div style={actionsBar}>
          <Link to="/perfil" style={btnSecondary}>
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            style={saving ? btnSaveDisabled : btnSave}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#E04820'; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#FF5C35'; }}
          >
            {saving ? 'Publicando…' : 'Publicar anuncio'}
          </button>
        </div>
      </form>

      {creadoAnuncio && (
        <EditarMediosModal
          anuncio={creadoAnuncio}
          perfilId={creadoAnuncio.perfil_id}
          onClose={() => handleCerrarModal(false)}
          onSaved={() => handleCerrarModal(true)}
        />
      )}
    </main>
  );
}