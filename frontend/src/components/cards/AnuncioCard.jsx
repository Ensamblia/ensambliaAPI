// src/components/cards/AnuncioCard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { extractList } from '@/api/axios';
import { AutorNombre } from '@/components/perfil/AutorNombre';
import { Button, Card, Tag } from '@/components/ui';
import styles from './AnuncioCard.module.css';

/* ── Caché global de tipos de anuncio (una sola carga por app) ── */
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

/* ── Color de la etiqueta según el tipo de anuncio ── */
function colorTipo(tipo = '') {
  const t = tipo.toLowerCase();
  if (t.includes('vend') || t.includes('compr')) return 'purple';
  if (t.includes('jam') || t.includes('evento') || t.includes('concierto')) return 'yellow';
  if (t.includes('local') || t.includes('sala')) return 'blue';
  if (t.includes('banda') || t.includes('grupo')) return 'coral';
  return 'green';
}

/* ── Helpers de icono por MIME ── */
function iconoParaMime(mime) {
  if (!mime) return '📎';
  if (mime === 'application/pdf') return '📕';
  if (mime === 'text/plain') return '📄';
  if (mime.startsWith('audio/')) return '🎵';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('application/msword')) return '📘';
  if (mime.includes('wordprocessingml')) return '📘';
  if (mime.includes('opendocument')) return '📗';
  return '📎';
}

function etiquetaParaMime(mime) {
  if (!mime) return 'Archivo';
  if (mime === 'application/pdf') return 'PDF';
  if (mime === 'text/plain') return 'Texto';
  if (mime.startsWith('audio/')) return 'Audio';
  if (mime.startsWith('video/')) return 'Vídeo';
  if (mime.startsWith('application/msword')) return 'Word';
  if (mime.includes('wordprocessingml')) return 'Word';
  if (mime.includes('opendocument')) return 'ODT';
  return 'Archivo';
}

/* ── Thumbnails ── */
function Thumbnails({ multimedias, onClick }) {
  if (!multimedias || multimedias.length === 0) return null;

  const imgs = multimedias.filter((m) => (m.tipo_mime || '').startsWith('image/'));

  if (imgs.length === 0) {
    const first = multimedias[0];
    const mime = first.tipo_mime || '';
    return (
      <div className={styles.thumbsWrapper} onClick={onClick}>
        <div className={styles.docThumb}>
          <span className={styles.docThumbIcon}>{iconoParaMime(mime)}</span>
          <span className={styles.docThumbLabel}>{etiquetaParaMime(mime)}</span>
        </div>
      </div>
    );
  }

  if (imgs.length === 1) {
    return (
      <div className={styles.thumbsWrapper} onClick={onClick}>
        <img src={imgs[0].archivo_url} alt={imgs[0].nombre} className={styles.oneThumb} />
      </div>
    );
  }

  if (imgs.length === 2) {
    return (
      <div className={styles.thumbsWrapper} onClick={onClick}>
        <div className={styles.twoThumbs}>
          <img src={imgs[0].archivo_url} alt={imgs[0].nombre} className={styles.cellFull} />
          <img src={imgs[1].archivo_url} alt={imgs[1].nombre} className={styles.cellFull} />
        </div>
      </div>
    );
  }

  const restantes = imgs.length - 3;
  return (
    <div className={styles.thumbsWrapper} onClick={onClick}>
      <div className={styles.threePlusThumbs}>
        <img src={imgs[0].archivo_url} alt={imgs[0].nombre} className={styles.cellLeft} />
        <img src={imgs[1].archivo_url} alt={imgs[1].nombre} className={styles.cellRightTop} />
        <div className={styles.cellRightBottom}>
          <img src={imgs[2].archivo_url} alt={imgs[2].nombre} className={styles.cellFull} />
          {restantes > 0 && <div className={styles.moreOverlay}>+{restantes}</div>}
        </div>
      </div>
    </div>
  );
}

export function AnuncioCard({ anuncio }) {
  const navigate = useNavigate();
  const [contactando, setContactando] = useState(false);
  const [error, setError] = useState('');
  const tipos = useTipos();

  const fecha = anuncio?.fecha_publicacion
    ? new Date(anuncio.fecha_publicacion).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const tipoLabel = tipos[anuncio?.tipo_anuncio_id] || null;
  const contenido = anuncio?.contenido || '';
  const multimedias = anuncio?.multimedias || [];

  const handleContactar = async (e) => {
    e.stopPropagation();
    setError('');
    setContactando(true);
    try {
      const res = await api.post(`/chats/con/${anuncio.perfil_id}`);
      navigate(`/chat?chat=${res.data.chat_id}`);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('Necesitas crear tu perfil antes de contactar.');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.error || 'No puedes contactar contigo mismo.');
      } else {
        setError('No se pudo iniciar la conversación.');
      }
    } finally {
      setContactando(false);
    }
  };

  const irAlDetalle = () => navigate(`/anuncios/${anuncio.anuncio_id}`);

  return (
    <Card
      as="article"
      interactive
      onClick={irAlDetalle}
      className={styles.card}
    >
      <Thumbnails multimedias={multimedias} onClick={irAlDetalle} />

      <div className={styles.body}>
        <div className={styles.top}>
          {tipoLabel ? <Tag color={colorTipo(tipoLabel)}>{tipoLabel}</Tag> : <span />}
          <span className={styles.dateText}>{fecha || '—'}</span>
        </div>

        <h3 className={styles.title}>{anuncio?.titulo || 'Sin título'}</h3>

        <p className={styles.bodyText}>
          {contenido.length > 130 ? contenido.slice(0, 130) + '…' : contenido || 'Sin descripción.'}
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <p className={styles.porLine}>
            <AutorNombre perfilId={anuncio?.perfil_id} />
          </p>
          <div className={styles.footerActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContactar}
              loading={contactando}
              disabled={contactando}
            >
              {contactando ? 'Contactando…' : 'Contactar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                irAlDetalle();
              }}
              rightIcon={<span aria-hidden="true">→</span>}
            >
              Ver más
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}