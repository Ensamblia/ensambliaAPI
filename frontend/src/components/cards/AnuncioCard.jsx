import React from 'react';

export function AnuncioCard({ anuncio }) {
  return (
    <div className="anuncio-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{anuncio?.titulo || 'Sin título'}</h3>
      <p style={{ margin: '0 0 10px 0' }}>{anuncio?.contenido || anuncio?.descripcion || 'Sin contenido'}</p>
      {anuncio?.created_at && (
        <small style={{ color: '#666' }}>
          Publicado el: {new Date(anuncio.created_at).toLocaleDateString()}
        </small>
      )}
    </div>
  );
}

