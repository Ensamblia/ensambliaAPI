// src/components/perfil/AutorNombre.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPerfilPublico } from '@/api/perfiles';
import styles from './AutorNombre.module.css';

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

    return () => {
      cancelado = true;
    };
  }, [perfilId]);

  if (!loaded || !perfil) {
    return <span className={styles.plain}>Usuario</span>;
  }

  return (
    <Link to={`/perfiles/${perfilId}`} className={styles.link}>
      {perfil.nombre} {perfil.apellido}
    </Link>
  );
}