import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const section = {
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #EBEBEB',
};

const heading = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  fontWeight: 700,
  color: '#0F0F0F',
  letterSpacing: '-0.02em',
  margin: '0 0 16px',
};

const list = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  marginBottom: '20px',
};

const item = {
  border: '1px solid #EBEBEB',
  borderRadius: '10px',
  padding: '14px 16px',
};

const itemHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '8px',
  marginBottom: '4px',
};

const authorName = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 700,
  color: '#0F0F0F',
};

const dateText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11.5px',
  color: '#D4D4D4',
};

const contentText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#2B2B2B',
  lineHeight: 1.6,
  margin: 0,
  whiteSpace: 'pre-wrap',
};

const actionsRow = {
  display: 'flex',
  gap: '12px',
  marginTop: '8px',
};

const actionBtn = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: '#8A8A8A',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const actionBtnDanger = {
  ...actionBtn,
  color: '#E0402B',
};

const textarea = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#0F0F0F',
  backgroundColor: '#FAFAFA',
  outline: 'none',
  resize: 'vertical',
  minHeight: '70px',
};

const formRow = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const btnPrimary = {
  alignSelf: 'flex-end',
  padding: '9px 18px',
  backgroundColor: '#FF5C35',
  color: '#FFFFFF',
  borderRadius: '7px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '13px',
  border: 'none',
  cursor: 'pointer',
};

const btnPrimaryDisabled = {
  ...btnPrimary,
  backgroundColor: '#F2B3A2',
  cursor: 'not-allowed',
};

const btnSecondary = {
  ...actionBtn,
  padding: '6px 0',
};

const emptyText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
  marginBottom: '20px',
};

const noticeText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#8A8A8A',
};

const errorText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#E0402B',
  margin: '0 0 8px',
};

const loginLink = {
  color: '#FF5C35',
  fontWeight: 600,
  textDecoration: 'none',
};

export function Comentarios({ anuncioId }) {
  const { user } = useContext(AuthContext);

  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfiles, setPerfiles] = useState({});
  const [miPerfilId, setMiPerfilId] = useState(null);

  const [nuevoContenido, setNuevoContenido] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const [editandoId, setEditandoId] = useState(null);
  const [editContenido, setEditContenido] = useState('');
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const cargarPerfil = async (perfilId, cache) => {
    if (cache[perfilId] || !perfilId) return cache;
    try {
      const res = await api.get(`/perfiles/${perfilId}`);
      return { ...cache, [perfilId]: res.data };
    } catch {
      return { ...cache, [perfilId]: null };
    }
  };

  const cargarComentarios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/comentarios/anuncio', { params: { anuncio_id: anuncioId } });
      const lista = res.data;
      setComentarios(lista);

      let cache = perfiles;
      for (const c of lista) {
        cache = await cargarPerfil(c.perfil_id, cache);
      }
      setPerfiles(cache);
    } catch (err) {
      if (err.response?.status === 404) {
        setComentarios([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComentarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anuncioId]);

  useEffect(() => {
    if (!user) {
      setMiPerfilId(null);
      return;
    }
    api.get('/perfiles/me')
      .then((res) => setMiPerfilId(res.data.perfil_id))
      .catch(() => setMiPerfilId(null));
  }, [user]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setErrorForm('');
    if (!nuevoContenido.trim()) return;

    setEnviando(true);
    try {
      const res = await api.post('/comentarios', {
        contenido: nuevoContenido.trim(),
        esta_eliminado: false,
        anuncio_id: anuncioId,
      });
      setComentarios((prev) => [res.data, ...prev]);
      const cache = await cargarPerfil(res.data.perfil_id, perfiles);
      setPerfiles(cache);
      setNuevoContenido('');
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorForm(err.response.data?.error || 'Necesitas crear tu perfil antes de comentar.');
      } else {
        setErrorForm('No se pudo publicar el comentario.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const iniciarEdicion = (comentario) => {
    setEditandoId(comentario.comentario_id);
    setEditContenido(comentario.contenido);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditContenido('');
  };

  const guardarEdicion = async (comentarioId) => {
    if (!editContenido.trim()) return;
    setGuardandoEdicion(true);
    try {
      const res = await api.put(`/comentarios/${comentarioId}`, { contenido: editContenido.trim() });
      setComentarios((prev) => prev.map((c) => (c.comentario_id === comentarioId ? res.data : c)));
      setEditandoId(null);
    } catch {
      setErrorForm('No se pudo guardar la edición.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleBorrar = async (comentarioId) => {
    if (!window.confirm('¿Borrar este comentario?')) return;
    try {
      await api.delete(`/comentarios/${comentarioId}`);
      setComentarios((prev) => prev.filter((c) => c.comentario_id !== comentarioId));
    } catch {
      setErrorForm('No se pudo borrar el comentario.');
    }
  };

  return (
    <section style={section}>
      <h2 style={heading}>Comentarios{comentarios.length > 0 ? ` (${comentarios.length})` : ''}</h2>

      {loading && <p style={noticeText}>Cargando comentarios…</p>}

      {!loading && comentarios.length === 0 && (
        <p style={emptyText}>Todavía no hay comentarios. Sé el primero en escribir uno.</p>
      )}

      {!loading && comentarios.length > 0 && (
        <div style={list}>
          {comentarios.map((c) => {
            const perfil = perfiles[c.perfil_id];
            const nombre = perfil ? `${perfil.nombre} ${perfil.apellido}` : 'Usuario';
            const fecha = c.fecha_publicacion
              ? new Date(c.fecha_publicacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
              : '';
            const esMio = miPerfilId !== null && c.perfil_id === miPerfilId;
            const enEdicion = editandoId === c.comentario_id;

            return (
              <div key={c.comentario_id} style={item}>
                <div style={itemHeader}>
                  <span style={authorName}>{nombre}</span>
                  <span style={dateText}>{fecha}</span>
                </div>

                {enEdicion ? (
                  <div style={formRow}>
                    <textarea
                      style={textarea}
                      value={editContenido}
                      onChange={(e) => setEditContenido(e.target.value)}
                    />
                    <div style={actionsRow}>
                      <button
                        type="button"
                        style={guardandoEdicion ? btnPrimaryDisabled : btnPrimary}
                        disabled={guardandoEdicion}
                        onClick={() => guardarEdicion(c.comentario_id)}
                      >
                        {guardandoEdicion ? 'Guardando…' : 'Guardar'}
                      </button>
                      <button type="button" style={btnSecondary} onClick={cancelarEdicion}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={contentText}>{c.contenido}</p>
                    {esMio && (
                      <div style={actionsRow}>
                        <button type="button" style={actionBtn} onClick={() => iniciarEdicion(c)}>
                          Editar
                        </button>
                        <button type="button" style={actionBtnDanger} onClick={() => handleBorrar(c.comentario_id)}>
                          Borrar
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {errorForm && <p style={errorText}>{errorForm}</p>}

      {user ? (
        <form style={formRow} onSubmit={handleCrear}>
          <textarea
            style={textarea}
            placeholder="Escribe un comentario…"
            value={nuevoContenido}
            onChange={(e) => setNuevoContenido(e.target.value)}
          />
          <button type="submit" disabled={enviando} style={enviando ? btnPrimaryDisabled : btnPrimary}>
            {enviando ? 'Publicando…' : 'Comentar'}
          </button>
        </form>
      ) : (
        <p style={noticeText}>
          <Link to="/login" style={loginLink}>Inicia sesión</Link> para comentar.
        </p>
      )}
    </section>
  );
}
