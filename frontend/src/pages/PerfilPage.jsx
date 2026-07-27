import React from 'react';

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

/* ── Actions ── */
const actionsBar = {
  display: 'flex',
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

const btnCancel = {
  ...btnSave,
  backgroundColor: 'transparent',
  color: '#8A8A8A',
  border: '1px solid #EBEBEB',
};

const INSTRUMENTOS = ['Guitarra', 'Piano', 'Batería', 'Bajo', 'Voz', 'Violín', 'Saxofón', 'Trompeta'];
const GENEROS      = ['Rock', 'Jazz', 'Pop', 'Clásica', 'Flamenco', 'Electrónica', 'Reggae', 'Metal'];

function useTags(initial = []) {
  const [active, setActive] = React.useState(initial);
  const toggle = (tag) =>
    setActive((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  return [active, toggle];
}

const addFocusStyles = (e) => {
  e.target.style.borderColor = '#FF5C35';
  e.target.style.boxShadow   = '0 0 0 3px rgba(255,92,53,0.10)';
  e.target.style.backgroundColor = '#FFFFFF';
};
const removeFocusStyles = (e) => {
  e.target.style.borderColor = '#EBEBEB';
  e.target.style.boxShadow   = 'none';
  e.target.style.backgroundColor = '#FAFAFA';
};

export function PerfilPage() {
  const [instrSelected, toggleInstr] = useTags(['Guitarra']);
  const [genSelected,   toggleGen]   = useTags(['Rock', 'Jazz']);

  return (
    <main style={page}>
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '24px', color: '#0F0F0F' }}>
        Mi perfil
      </h1>

      {/* Profile header */}
      <div style={profileHeader}>
        <div style={avatarCircle}>🎸</div>
        <div style={profileInfo}>
          <p style={profileName}>Nombre artístico</p>
          <span style={profileHandle}>@usuario · Barcelona</span>
        </div>
      </div>

      {/* Form */}
      <div style={formCard}>
        {/* Información básica */}
        <div style={formSection}>
          <p style={sectionTitle}>Información básica</p>

          <div style={fieldGroup}>
            <label style={labelStyle}>Nombre artístico</label>
            <input style={inputStyle} placeholder="¿Cómo te conocen?" onFocus={addFocusStyles} onBlur={removeFocusStyles} />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Descripción</label>
            <textarea style={textareaStyle} placeholder="Cuéntanos sobre ti como músico…" onFocus={addFocusStyles} onBlur={removeFocusStyles} />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Ciudad</label>
            <input style={inputStyle} placeholder="Tu ciudad" onFocus={addFocusStyles} onBlur={removeFocusStyles} />
          </div>
        </div>

        {/* Instrumentos */}
        <div style={formSection}>
          <p style={sectionTitle}>Instrumentos</p>
          <div style={tagRow}>
            {INSTRUMENTOS.map((inst) => (
              <button
                key={inst}
                style={instrSelected.includes(inst) ? tagActive : tagBase}
                onClick={() => toggleInstr(inst)}
                onMouseEnter={(e) => { if (!instrSelected.includes(inst)) e.currentTarget.style.borderColor = '#D0D0D0'; }}
                onMouseLeave={(e) => { if (!instrSelected.includes(inst)) e.currentTarget.style.borderColor = '#EBEBEB'; }}
              >
                {inst}
              </button>
            ))}
          </div>
        </div>

        {/* Géneros */}
        <div style={formSectionLast}>
          <p style={sectionTitle}>Géneros musicales</p>
          <div style={tagRow}>
            {GENEROS.map((g) => (
              <button
                key={g}
                style={genSelected.includes(g) ? tagActive : tagBase}
                onClick={() => toggleGen(g)}
                onMouseEnter={(e) => { if (!genSelected.includes(g)) e.currentTarget.style.borderColor = '#D0D0D0'; }}
                onMouseLeave={(e) => { if (!genSelected.includes(g)) e.currentTarget.style.borderColor = '#EBEBEB'; }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={actionsBar}>
          <button
            style={btnCancel}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D0D0D0'; e.currentTarget.style.color = '#2B2B2B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EBEBEB'; e.currentTarget.style.color = '#8A8A8A'; }}
          >
            Cancelar
          </button>
          <button
            style={btnSave}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E04820'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF5C35'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </main>
  );
}
