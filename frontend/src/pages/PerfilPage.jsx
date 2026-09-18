import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const page = {
  maxWidth: '680px',
  margin: '0 auto',
  padding: '48px 24px 80px',
};

/* ── Profile header ── */
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

const profileInfo = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const profileName = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
  margin: 0,
};

const profileHandle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
};

/* ── Form card ── */
const formCard = {
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  overflow: 'hidden',
};

const formSection = {
  padding: '24px 28px',
  borderBottom: '1px solid #EBEBEB',
};

const formSectionLast = {
  padding: '24px 28px',
};

const sectionTitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  color: '#D4D4D4',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '16px',
};

const fieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  marginBottom: '14px',
};

const fieldRow = {
  display: 'flex',
  gap: '12px',
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
  minHeight: '88px',
  lineHeight: 1.6,
};

/* ── Tags ── */
const tagRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

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
  cursor: 'pointer',
  transition: 'border-color 140ms ease, background 140ms ease, color 140ms ease',
};

const tagActive = {
  ...tagBase,
  backgroundColor: '#0F0F0F',
  color: '#FFFFFF',
  borderColor: '#0F0F0F',
};

/* ── Actions / messages ── */
const actionsBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '10px',
  padding: '16px 28px',
  borderTop: '1px solid #EBEBEB',
  backgroundColor: '#FAFAFA',
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
  transition: 'background 140ms ease, transform 140ms ease',
};

const btnSaveDisabled = {
  ...btnSave,
  backgroundColor: '#F2B3A2',
  cursor: 'not-allowed',
};

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

const errorBanner = {
  ...noticeBanner,
  color: '#B3261E',
  backgroundColor: '#FDECEA',
  border: '1px solid #F5C6C2',
};

const successBanner = {
  ...noticeBanner,
  color: '#1E6B3A',
  backgroundColor: '#EAF7EE',
  border: '1px solid #BFE6CC',
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

const emptyForm = { nombre: '', apellido: '', correo: '', descripcion: '', comarcaTexto: '' };

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
          const comarca = comarcasRes.data.find((c) => c.comarca_id === perfil.comarca_id);
          setPerfilId(perfil.perfil_id);
          setForm({
            nombre: perfil.nombre || '',
            apellido: perfil.apellido || '',
            correo: perfil.correo || '',
            descripcion: perfil.descripcion || '',
            comarcaTexto: comarca ? comarca.nombre : '',
          });

          const [instrRes, genRes] = await Promise.all([
            api.get('/perfil-instrumentos/perfil', { params: { perfil_id: perfil.perfil_id } }).catch(() => ({ data: [] })),
            api.get('/perfil-genero-musicales/perfil', { params: { perfil_id: perfil.perfil_id } }).catch(() => ({ data: [] })),
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
        if (!cancelado) setErrorMsg('No se pudo cargar tu perfil. Inténtalo de nuevo.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => { cancelado = true; };
  }, []);

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
    const match = comarcas.find((c) => c.nombre.toLowerCase() === texto.toLowerCase());
    if (!match) return { comarca_id: null, ok: false };
    return { comarca_id: match.comarca_id, ok: true };
  };

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!form.nombre.trim() || !form.apellido.trim() || !form.correo.trim() || !form.descripcion.trim()) {
      setErrorMsg('Nombre, apellido, correo y descripción son obligatorios.');
      return;
    }

    const { comarca_id, ok } = resolverComarcaId();
    if (!ok) {
      setErrorMsg('Esa comarca no existe. Elige una de la lista de sugerencias.');
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
      descripcion: form.descripcion.trim(),
      comarca_id,
    };

    setSaving(true);
    try {
      let currentPerfilId = perfilId;

      if (currentPerfilId) {
        await api.put(`/perfiles/${currentPerfilId}`, payload);
      } else {
        const res = await api.post('/perfiles', payload);
        currentPerfilId = res.data.perfil_id;
        setPerfilId(currentPerfilId);
      }

      const instrAdded = [...instrSelected].filter((id) => !instrOriginal.has(id));
      const instrRemoved = [...instrOriginal].filter((id) => !instrSelected.has(id));
      const genAdded = [...genSelected].filter((id) => !genOriginal.has(id));
      const genRemoved = [...genOriginal].filter((id) => !genSelected.has(id));

      await Promise.all([
        ...instrAdded.map((id) => api.post('/perfil-instrumentos', { perfil_id: currentPerfilId, instrumento_id: id })),
        ...instrRemoved.map((id) => api.delete(`/perfil-instrumentos/${currentPerfilId}/${id}`)),
        ...genAdded.map((id) => api.post('/perfil-genero-musicales', { perfil_id: currentPerfilId, genero_id: id })),
        ...genRemoved.map((id) => api.delete(`/perfil-genero-musicales/${currentPerfilId}/${id}`)),
      ]);

      setInstrOriginal(new Set(instrSelected));
      setGenOriginal(new Set(genSelected));
      setSuccessMsg('Perfil guardado correctamente.');
    } catch (err) {
      setErrorMsg('No se pudo guardar el perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={page}>
        <p style={{ fontFamily: "'Inter', sans-serif", color: '#8A8A8A' }}>Cargando tu perfil…</p>
      </main>
    );
  }

  return (
    <main style={page}>
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '24px', color: '#0F0F0F' }}>
        Mi perfil
      </h1>

      {!perfilId && (
        <p style={noticeBanner}>Aún no has creado tu perfil de músico. Rellena el formulario y guarda para crearlo.</p>
      )}
      {errorMsg && <p style={errorBanner}>{errorMsg}</p>}
      {successMsg && <p style={successBanner}>{successMsg}</p>}

      {/* Profile header */}
      <div style={profileHeader}>
        <div style={avatarCircle}>🎸</div>
        <div style={profileInfo}>
          <p style={profileName}>{form.nombre || form.apellido ? `${form.nombre} ${form.apellido}`.trim() : 'Nuevo perfil'}</p>
          <span style={profileHandle}>{form.comarcaTexto || 'Sin comarca'}</span>
        </div>
      </div>

      {/* Form */}
      <div style={formCard}>
        {/* Información básica */}
        <div style={formSection}>
          <p style={sectionTitle}>Información básica</p>

          <div style={fieldRow}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Nombre</label>
              <input style={inputStyle} value={form.nombre} onChange={handleChange('nombre')} onFocus={addFocusStyles} onBlur={removeFocusStyles} />
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>Apellido</label>
              <input style={inputStyle} value={form.apellido} onChange={handleChange('apellido')} onFocus={addFocusStyles} onBlur={removeFocusStyles} />
            </div>
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Correo</label>
            <input type="email" style={inputStyle} value={form.correo} onChange={handleChange('correo')} onFocus={addFocusStyles} onBlur={removeFocusStyles} />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Descripción</label>
            <textarea style={textareaStyle} placeholder="Cuéntanos sobre ti como músico…" value={form.descripcion} onChange={handleChange('descripcion')} onFocus={addFocusStyles} onBlur={removeFocusStyles} />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Comarca</label>
            <input
              style={inputStyle}
              placeholder="Escribe tu comarca…"
              value={form.comarcaTexto}
              onChange={handleChange('comarcaTexto')}
              onFocus={addFocusStyles}
              onBlur={removeFocusStyles}
              list="comarcas-list"
            />
            <datalist id="comarcas-list">
              {comarcas.map((c) => <option key={c.comarca_id} value={c.nombre} />)}
            </datalist>
          </div>
        </div>

        {/* Instrumentos */}
        <div style={formSection}>
          <p style={sectionTitle}>Instrumentos</p>
          <div style={tagRow}>
            {instrumentos.map((inst) => (
              <button
                key={inst.instrumento_id}
                type="button"
                style={instrSelected.has(inst.instrumento_id) ? tagActive : tagBase}
                onClick={() => toggleInstr(inst.instrumento_id)}
                onMouseEnter={(e) => { if (!instrSelected.has(inst.instrumento_id)) e.currentTarget.style.borderColor = '#D0D0D0'; }}
                onMouseLeave={(e) => { if (!instrSelected.has(inst.instrumento_id)) e.currentTarget.style.borderColor = '#EBEBEB'; }}
              >
                {inst.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Géneros */}
        <div style={formSectionLast}>
          <p style={sectionTitle}>Géneros musicales</p>
          <div style={tagRow}>
            {generos.map((g) => (
              <button
                key={g.genero_musical_id}
                type="button"
                style={genSelected.has(g.genero_musical_id) ? tagActive : tagBase}
                onClick={() => toggleGen(g.genero_musical_id)}
                onMouseEnter={(e) => { if (!genSelected.has(g.genero_musical_id)) e.currentTarget.style.borderColor = '#D0D0D0'; }}
                onMouseLeave={(e) => { if (!genSelected.has(g.genero_musical_id)) e.currentTarget.style.borderColor = '#EBEBEB'; }}
              >
                {g.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={actionsBar}>
          <button
            type="button"
            disabled={saving}
            style={saving ? btnSaveDisabled : btnSave}
            onClick={handleSave}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#E04820'; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#FF5C35'; }}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </main>
  );
}
