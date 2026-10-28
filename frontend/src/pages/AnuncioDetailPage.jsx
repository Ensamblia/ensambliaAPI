// src/pages/AnuncioDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { extractList } from '@/api/axios';
import { AutorNombre } from '@/components/perfil/AutorNombre';
import { AnuncioMultimediaGaleria } from '@/components/multimedia/AnuncioMultimediaGaleria';
import { Comentarios } from '@/components/comentarios/Comentarios';
import { BusquedaAnuncioInfo } from '@/components/match/BusquedaAnuncioInfo';
import { EmptyState, PageHeader, Spinner, Tag } from '@/components/ui';
import styles from './AnuncioDetailPage.module.css';

/* ── Caché de tipos (compartida con AnuncioCard) ── */
let TIPOS_CACHE = null;
let TIPOS_PROMISE = null;

function cargarTipos() {
  if (TIPOS_CACHE) return Promise.resolve(TIPOS_CACHE);
  if (TIPOS_PROMISE) return TIPOS_PROMISE;
  TIPOS_PROMISE = api
    .get('/tipo-anuncios/')
    .then((res) => {
      const lista = extractList(res);
      const mapa = {};
      lista.forEach((t) => {
        mapa[t.tipo_anuncio_id] = t.tipo;
      });
      TIPOS_CACHE = mapa;
      return mapa;
    })
    .catch(() => {
      TIPOS_CACHE = {};
      return {};
    });
  return TIPOS_PROMISE;
}

function useTipos() {
  const [tipos, setTipos] = useState(TIPOS_CACHE || {});
  useEffect(() => {
    if (TIPOS_CACHE) return;
    let cancelado = false;
    cargarTipos().then((mapa) => {
      if (!cancelado) setTipos(mapa);
    });
    return () => {
      cancelado = true;
    };
  }, []);
  return tipos;
}

export function AnuncioDetailPage() {
  const { id } = useParams();
  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tipos = useTipos();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/anuncios/${id}/`)
      .then((res) => setAnuncio(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('not-found');
        } else {
          setError('server');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fecha = anuncio?.fecha_publicacion
    ? new Date(anuncio.fecha_publicacion).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const tipoLabel = tipos[anuncio?.tipo_anuncio_id] || null;

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.stateBox}>
          <Spinner size="lg" aria-label="Cargando anuncio" />
        </div>
      </main>
    );
  }

  if (error === 'not-found') {
    return (
      <main className={styles.page}>
        <PageHeader title="Anuncio no encontrado" backTo="/anuncios" backLabel="Anuncios" />
        <EmptyState
          icon="🔍"
          title="Este anuncio no existe"
          description="Puede que se haya eliminado o que la URL sea incorrecta."
        />
      </main>
    );
  }

  if (error === 'server') {
    return (
      <main className={styles.page}>
        <PageHeader title="Error" backTo="/anuncios" backLabel="Anuncios" />
        <EmptyState
          icon="⚠️"
          title="No se pudo cargar el anuncio"
          description="Inténtalo de nuevo en unos segundos."
        />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <PageHeader
        title={anuncio.titulo || 'Sin título'}
        subtitle={
          <>
            {fecha || '—'} · Publicado por <AutorNombre perfilId={anuncio.perfil_id} />
          </>
        }
        backTo="/anuncios"
        backLabel="Anuncios"
      />

      {tipoLabel && (
        <div className={styles.tagRow}>
          <Tag color="yellow">{tipoLabel}</Tag>
        </div>
      )}

      <p className={styles.body}>{anuncio.contenido || 'Sin descripción.'}</p>

      <AnuncioMultimediaGaleria multimedias={anuncio.multimedias || []} />

      <BusquedaAnuncioInfo anuncioId={anuncio.anuncio_id} />

      <Comentarios anuncioId={anuncio.anuncio_id} />
    </main>
  );
}