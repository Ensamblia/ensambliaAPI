// src/components/comentarios/Comentarios.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import api, { extractList, parseApiError } from '@/api/axios';
import {
  Button,
  Card,
  EmptyState,
  Field,
  Spinner,
  Textarea,
} from '@/components/ui';
import styles from './Comentarios.module.css';

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
      const res = await api.get('/comentarios/anuncio', {
        params: { anuncio_id: anuncioId },
      });
      const lista = extractList(res);
      setComentarios(lista);

      let cache = perfiles;
      for (const c of lista) {
        cache = await cargarPerfil(c.perfil_id, cache);
      }
      setPerfiles(cache);
    } catch (err) {
      if (err.response?.status === 404) {
        setComentarios([]);
      } else {
        setErrorForm(parseApiError(err, 'No se pudieron cargar los comentarios.'));
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
    api
      .get('/perfiles/me')
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
        setErrorForm(parseApiError(err, 'Necesitas crear tu perfil antes de comentar.'));
      } else {
        setErrorForm(parseApiError(err, 'No se pudo publicar el comentario.'));
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
      const res = await api.put(`/comentarios/${comentarioId}`, {
        contenido: editContenido.trim(),
      });
      setComentarios((prev) =>
        prev.map((c) => (c.comentario_id === comentarioId ? res.data : c)),
      );
      setEditandoId(null);
    } catch (err) {
      setErrorForm(parseApiError(err, 'No se pudo guardar la edición.'));
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleBorrar = async (comentarioId) => {
    if (!window.confirm('¿Borrar este comentario?')) return;
    try {
      await api.delete(`/comentarios/${comentarioId}`);
      setComentarios((prev) => prev.filter((c) => c.comentario_id !== comentarioId));
    } catch (err) {
      setErrorForm(parseApiError(err, 'No se pudo borrar el comentario.'));
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        Comentarios{comentarios.length > 0 ? ` (${comentarios.length})` : ''}
      </h2>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <Spinner size="md" aria-label="Cargando comentarios" />
        </div>
      )}

      {!loading && comentarios.length === 0 && (
        <EmptyState
          compact
          title="Todavía no hay comentarios"
          description="Sé el primero en escribir uno."
        />
      )}

      {!loading && comentarios.length > 0 && (
        <div className={styles.list}>
          {comentarios.map((c) => {
            const perfil = perfiles[c.perfil_id];
            const nombre = perfil
              ? `${perfil.nombre} ${perfil.apellido}`
              : 'Usuario';
            const fecha = c.fecha_publicacion
              ? new Date(c.fecha_publicacion).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '';
            const esMio = miPerfilId !== null && c.perfil_id === miPerfilId;
            const enEdicion = editandoId === c.comentario_id;

            return (
              <Card key={c.comentario_id} className={styles.item} padding="none">
                <div className={styles.itemHeader}>
                  <Link to={`/perfiles/${c.perfil_id}`} className={styles.author}>
                    {nombre}
                  </Link>
                  <span className={styles.date}>{fecha}</span>
                </div>

                {enEdicion ? (
                  <div className={styles.form}>
                    <Textarea
                      value={editContenido}
                      onChange={(e) => setEditContenido(e.target.value)}
                      aria-label="Editar comentario"
                    />
                    <div className={styles.formActions}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelarEdicion}
                        disabled={guardandoEdicion}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => guardarEdicion(c.comentario_id)}
                        loading={guardandoEdicion}
                      >
                        {guardandoEdicion ? 'Guardando…' : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={styles.content}>{c.contenido}</p>
                    {esMio && (
                      <div className={styles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => iniciarEdicion(c)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBorrar(c.comentario_id)}
                        >
                          Borrar
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {errorForm && <p className={styles.error}>{errorForm}</p>}

      {user ? (
        <form className={styles.form} onSubmit={handleCrear}>
          <Field label="Nuevo comentario">
            <Textarea
              placeholder="Escribe un comentario…"
              value={nuevoContenido}
              onChange={(e) => setNuevoContenido(e.target.value)}
            />
          </Field>
          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={enviando}
              disabled={!nuevoContenido.trim()}
            >
              {enviando ? 'Publicando…' : 'Comentar'}
            </Button>
          </div>
        </form>
      ) : (
        <p className={styles.notice}>
          <Link to="/login">Inicia sesión</Link> para comentar.
        </p>
      )}
    </section>
  );
}