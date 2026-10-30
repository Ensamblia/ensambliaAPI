// src/pages/InicioPage.jsx
// Portada de la app con sesión iniciada: saludo, accesos rápidos y resumen.
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, MapPin, Megaphone, MessageCircle, Store, Users } from 'lucide-react';
import api, { extractList } from '@/api/axios';
import { listarEventos } from '@/api/eventos';
import { getMatches } from '@/api/match';
import { AnuncioCard } from '@/components/cards/AnuncioCard';
import { EventoCard } from '@/components/eventos/EventoCard';
import { Avatar, Button, EmptyState, Spinner } from '@/components/ui';
import { AuthContext } from '@/context/AuthContext';
import { PerfilContext } from '@/context/PerfilContext';
import { AnilloMatch } from '@/components/match/AnilloMatch';
import { motivosMatch, puntuacionMatch } from '@/utils/match';
import styles from './InicioPage.module.css';

const ACCESOS = [
  { to: '/anuncios', titulo: 'Anuncios', texto: 'Busca banda o integrantes', icon: Megaphone, tono: 'yellow' },
  { to: '/mercado', titulo: 'Mercado', texto: 'Compra y vende equipo', icon: Store, tono: 'blue' },
  { to: '/eventos', titulo: 'Eventos', texto: 'Jams y conciertos cerca', icon: CalendarDays, tono: 'green' },
  { to: '/chat', titulo: 'Mensajes', texto: 'Habla con otros músicos', icon: MessageCircle, tono: 'purple' },
  { to: '/bandas', titulo: 'Bandas', texto: 'Crea o únete a una banda', icon: Users, tono: 'coral' },
];

export function InicioPage() {
  const { user } = useContext(AuthContext);
  const { me } = useContext(PerfilContext);
  const [anuncios, setAnuncios] = useState(null);
  const [eventos, setEventos] = useState(null);
  const [match, setMatch] = useState(undefined);

  useEffect(() => {
    api
      .get('/anuncios/', { params: { limit: 4, ordering: '-fecha_publicacion' } })
      .then((res) => setAnuncios((res.data?.results ?? extractList(res)).slice(0, 4)))
      .catch(() => setAnuncios([]));
    listarEventos({ limit: 3 })
      .then((data) => setEventos((data.results ?? []).slice(0, 3)))
      .catch(() => setEventos([]));
    getMatches({ busco: 'musico' })
      .then((data) => setMatch(data.results?.[0] ?? null))
      .catch(() => setMatch(null));
  }, []);

  const nombre = me?.nombre || user?.usuario || '';

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTexto}>
          <h1>Hola, {nombre}.</h1>
          <p>
            {me && !me.disponibilidad
              ? 'Ahora mismo no apareces como disponible. Mira qué hay hoy en la comunidad.'
              : 'Estás visible para nuevos proyectos. Mira qué hay hoy en la comunidad.'}
          </p>
          <div className={styles.heroAcciones}>
            <Button to="/anuncios/crear" variant="dark">
              Publicar anuncio
            </Button>
            <Button to="/match" variant="secondary" className={styles.heroSecundario}>
              Buscar músicos
            </Button>
          </div>
        </div>
        <div className={styles.heroDeco} aria-hidden="true">
          <span className={styles.nota}>♪</span>
          <span className={styles.nota2}>♫</span>
        </div>
      </section>

      <nav className={styles.accesos} aria-label="Accesos rápidos">
        {ACCESOS.map(({ to, titulo, texto, icon: Icon, tono }) => (
          <Link key={to} to={to} className={[styles.acceso, styles[tono]].join(' ')}>
            <span className={styles.accesoIcono}>
              <Icon size={19} aria-hidden="true" />
            </span>
            <strong>{titulo}</strong>
            <span>{texto}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.columnas}>
        <section className={styles.panel}>
          <header className={styles.panelCabecera}>
            <h2>Últimos anuncios</h2>
            <Link to="/anuncios" className={styles.verTodo}>
              Ver todo <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </header>
          {anuncios === null && (
            <div className={styles.cargando}>
              <Spinner aria-label="Cargando anuncios" />
            </div>
          )}
          {anuncios?.length === 0 && (
            <EmptyState compact icon="📣" title="Aún no hay anuncios" description="Sé la primera persona en publicar uno." />
          )}
          {anuncios?.length > 0 && (
            <div className={styles.anuncios}>
              {anuncios.map((a) => (
                <AnuncioCard key={a.anuncio_id} anuncio={a} />
              ))}
            </div>
          )}
        </section>

        <aside className={styles.lateral}>
          <section className={styles.match}>
            <h2>Tu mejor match</h2>
            {match === undefined && <Spinner inverted aria-label="Buscando tu mejor match" />}
            {match === null && (
              <p className={styles.matchVacio}>
                Completa tu comarca, estilos e instrumentos en tu perfil y te sugeriremos con quién sonar bien.
              </p>
            )}
            {match && (
              <>
                <div className={styles.matchPersona}>
                  <AnilloMatch valor={puntuacionMatch(match)} tono="oscuro" size={80} />
                  <div>
                    <Link to={`/perfiles/${match.perfil_id}`} className={styles.matchNombre}>
                      {[match.nombre, match.apellido].filter(Boolean).join(' ')}
                    </Link>
                    {match.zona && (
                      <p className={styles.matchZona}>
                        <MapPin size={14} aria-hidden="true" /> {match.zona}
                      </p>
                    )}
                  </div>
                </div>
                <ul className={styles.motivos}>
                  {motivosMatch(match).slice(0, 3).map((m) => (
                    <li key={m}>
                      <Check size={15} aria-hidden="true" /> {m}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Button to="/match" variant="primary" block>
              Ver todos mis matches
            </Button>
          </section>

          <section className={styles.panel}>
            <header className={styles.panelCabecera}>
              <h2>Próximos eventos</h2>
              <Link to="/eventos" className={styles.verTodo}>
                Calendario <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </header>
            {eventos === null && <Spinner aria-label="Cargando eventos" />}
            {eventos?.length === 0 && <p className={styles.matchVacio}>No hay eventos a la vista.</p>}
            <div className={styles.eventos}>
              {eventos?.map((e) => (
                <EventoCard key={e.evento_id} evento={e} />
              ))}
            </div>
          </section>

          {me && (
            <Link to="/perfil" className={styles.perfilMini}>
              <Avatar name={nombre} src={me.foto_url} size="md" />
              <span className={styles.perfilMiniTexto}>
                <strong>Tu perfil</strong>
                <span>Mantenlo al día para mejores matches</span>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}
