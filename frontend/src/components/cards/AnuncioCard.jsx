import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { extractList } from '../../api/axios';
import { AutorNombre } from '../perfil/AutorNombre';

/* ── Pill tag ── */
const typeTag = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 9px',
  backgroundColor: '#F2F2F2',
  color: '#8A8A8A',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  alignSelf: 'flex-start',
};

const accentTag = {
  ...typeTag,
  backgroundColor: '#FFF0EC',
  color: '#FF5C35',
};

const card = {
  border: '1px solid #EBEBEB',
  borderRadius: '12px',
  padding: 0,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  transition: 'box-shadow 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1), border-color 220ms ease',
  cursor: 'pointer',
  overflow: 'hidden',
};

const body = {
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const title = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  fontWeight: 700,
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
  lineHeight: 1.3,
  margin: 0,
};

const bodyText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  color: '#8A8A8A',
  lineHeight: 1.6,
  margin: 0,
};

const porLine = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#8A8A8A',
  margin: 0,
};

const footer = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '12px',
  borderTop: '1px solid #F2F2F2',
  marginTop: '2px',
};

const dateText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#D4D4D4',
  letterSpacing: '0.01em',
};

const arrowBtn = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: '#FF5C35',
  letterSpacing: '-0.01em',
  display: 'flex',
  alignItems: 'center',
  gap: '3px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const footerActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const contactBtn = {
  ...arrowBtn,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const contactBtnDisabled = {
  ...contactBtn,
  color: '#D4D4D4',
  cursor: 'not-allowed',
};

const errorText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#B3261E',
  margin: 0,
};

/* ── Thumbnails ── */
const thumbsWrapper = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 10',
  backgroundColor: '#F2F2F2',
  overflow: 'hidden',
};

const oneThumb = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const twoThumbs = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2px',
  width: '100%',
  height: '100%',
};

const threePlusThumbs = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gridTemplateRows: '1fr 1fr',
  gap: '2px',
  width: '100%',
  height: '100%',
};

const cellFull = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const cellLeft = {
  gridRow: '1 / span 2',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const cellRightTop = {
  gridColumn: '2',
  gridRow: '1',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const cellRightBottom = {
  gridColumn: '2',
  gridRow: '2',
  position: 'relative',
  width: '100%',
  height: '100%',
};

const moreOverlay = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(15,15,15,0.55)',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.3rem',
  fontWeight: 700,
  letterSpacing: '-0.02em',
};

const docThumb = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  backgroundColor: '#FAFAFA',
};

const docThumbIcon = {
  fontSize: '2.2rem',
  lineHeight: 1,
};

const docThumbLabel = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  color: '#8A8A8A',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

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
    return () => { cancelado = true; };
  }, []);

  return tipos;
}

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

function Thumbnails({ multimedias, onClick }) {
  if (!multimedias || multimedias.length === 0) return null;

  const imgs = multimedias.filter((m) => (m.tipo_mime || '').startsWith('image/'));

  if (imgs.length === 0) {
    const first = multimedias[0];
    const mime = first.tipo_mime || '';
    return (
      <div style={thumbsWrapper} onClick={onClick}>
        <div style={docThumb}>
          <span style={docThumbIcon}>{iconoParaMime(mime)}</span>
          <span style={docThumbLabel}>{etiquetaParaMime(mime)}</span>
        </div>
      </div>
    );
  }

  if (imgs.length === 1) {
    return (
      <div style={thumbsWrapper} onClick={onClick}>
        <img src={imgs[0].archivo_url} alt={imgs[0].nombre} style={oneThumb} />
      </div>
    );
  }

  if (imgs.length === 2) {
    return (
      <div style={thumbsWrapper} onClick={onClick}>
        <div style={twoThumbs}>
          <img src={imgs[0].archivo_url} alt={imgs[0].nombre} style={cellFull} />
          <img src={imgs[1].archivo_url} alt={imgs[1].nombre} style={cellFull} />
        </div>
      </div>
    );
  }

  const restantes = imgs.length - 3;
  return (
    <div style={thumbsWrapper} onClick={onClick}>
      <div style={threePlusThumbs}>
        <img src={imgs[0].archivo_url} alt={imgs[0].nombre} style={cellLeft} />
        <img src={imgs[1].archivo_url} alt={imgs[1].nombre} style={cellRightTop} />
        <div style={cellRightBottom}>
          <img src={imgs[2].archivo_url} alt={imgs[2].nombre} style={cellFull} />
          {restantes > 0 && <div style={moreOverlay}>+{restantes}</div>}
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
        day: '2-digit', month: 'short', year: 'numeric',
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
    <div
      style={card}
      onClick={irAlDetalle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = '#D0D0D0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#EBEBEB';
      }}
    >
      <Thumbnails multimedias={multimedias} onClick={irAlDetalle} />

      <div style={body}>
        {tipoLabel && <span style={accentTag}>{tipoLabel}</span>}

        <h3 style={title}>{anuncio?.titulo || 'Sin título'}</h3>

        <p style={porLine}>
          por <AutorNombre perfilId={anuncio?.perfil_id} />
        </p>

        <p style={bodyText}>
          {contenido.length > 130 ? contenido.slice(0, 130) + '…' : contenido || 'Sin descripción.'}
        </p>

        {error && <p style={errorText}>{error}</p>}

        <div style={footer}>
          <span style={dateText}>{fecha || '—'}</span>
          <div style={footerActions}>
            <button
              type="button"
              disabled={contactando}
              style={contactando ? contactBtnDisabled : contactBtn}
              onClick={handleContactar}
            >
              {contactando ? 'Contactando…' : 'Contactar'}
            </button>
            <button
              type="button"
              style={arrowBtn}
              onClick={(e) => {
                e.stopPropagation();
                irAlDetalle();
              }}
            >
              Ver más <span style={{ fontSize: '14px' }}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}