import React from 'react';

export function AnuncioCard({ anuncio }) {
  return (
    <div className="anuncio-card">
      <h3>{anuncio?.titulo || 'Título Anuncio'}</h3>
      <p>{anuncio?.descripcion || 'Descripción del anuncio'}</p>
    </div>
  );
}
