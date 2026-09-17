import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPerfilPublico } from '../../api/perfiles';

const linkStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#0F0F0F',
  textDecoration: 'none',
};

const plainStyle = {
  ...linkStyle,
  color: '#8A8A8A',
  cursor: 'default',
};

export function AutorNombre({ perfilId }) {
  const [perfil, setPerfil] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setLoaded(false);
    setPerfil(null);

    if (!perfilId) {
      setLoaded(true);
      return;
    }

    getPerfilPublico(perfilId).then((data) => {
      if (cancelado) return;
      setPerfil(data);
      setLoaded(true);
    });

    return () => { cancelado = true; };
  }, [perfilId]);

  if (!loaded || !perfil) {
    return <span style={plainStyle}>Usuario</span>;
  }

  return (
    <Link to={`/perfiles/${perfilId}`} style={linkStyle}>
      {perfil.nombre} {perfil.apellido}
    </Link>
  );
}
