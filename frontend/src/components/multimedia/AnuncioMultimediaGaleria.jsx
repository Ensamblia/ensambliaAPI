import React from 'react';
import { MultimediaPreview } from './MultimediaPreview';

/* ── Styles ── */
const section = {
  marginTop: '24px',
};

const sectionTitle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  color: '#D4D4D4',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '12px',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '12px',
};

const itemCard = {
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#FFFFFF',
  transition: 'border-color 140ms ease, box-shadow 140ms ease',
};

export function AnuncioMultimediaGaleria({ multimedias = [] }) {
  if (!multimedias || multimedias.length === 0) {
    return null;
  }

  return (
    <section style={section}>
      <p style={sectionTitle}>
        Multimedia ({multimedias.length})
      </p>
      <div style={grid}>
        {multimedias.map((m) => (
          <div
            key={m.multimedia_id}
            style={itemCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D0D0D0';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#EBEBEB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <MultimediaPreview multimedia={m} />
          </div>
        ))}
      </div>
    </section>
  );
}