import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { AnuncioCard } from '../components/cards/AnuncioCard';

export function AnunciosPage() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/anuncios')
      .then((res) => {
        setAnuncios(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setAnuncios([]);
        } else {
          setError(err.message || 'Error al conectar con la API de anuncios');
        }
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Anuncios de Músicos y Servicios</h1>
      {loading && <p>Cargando anuncios desde el servidor...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && anuncios.length === 0 && (
        <p>No hay anuncios disponibles en este momento.</p>
      )}
      {!loading && !error && anuncios.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {anuncios.map((anuncio) => (
            <AnuncioCard key={anuncio.id || anuncio.anuncio_id} anuncio={anuncio} />
          ))}
        </div>
      )}
    </div>
  );
}

