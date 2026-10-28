// src/pages/EventosPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import api, { extractList } from '@/api/axios';
import { listarEventos } from '@/api/eventos';
import { CalendarioMes } from '@/components/eventos/CalendarioMes';
import { EventoCard } from '@/components/eventos/EventoCard';
import { Button, EmptyState, PageHeader, Select, Spinner } from '@/components/ui';
import { agruparPorDia, rangoMes } from '@/utils/eventos';
import styles from './EventosPage.module.css';

export function EventosPage() {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [ciudad, setCiudad] = useState('');
  const [genero, setGenero] = useState('');
  const [ciudades, setCiudades] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ultimaPeticionRef = useRef(0);

  useEffect(() => {
    Promise.all([
      api.get('/ciudades/').then(extractList).catch(() => []),
      api.get('/genero_musical/').then(extractList).catch(() => []),
    ]).then(([listaCiudades, listaGeneros]) => {
      setCiudades(listaCiudades);
      setGeneros(listaGeneros);
    });
  }, []);

  useEffect(() => {
    const peticion = ++ultimaPeticionRef.current;
    setLoading(true);
    setError('');
    const params = { ...rangoMes(anio, mes), limit: 100 };
    if (ciudad) params.ciudad = ciudad;
    if (genero) params.genero = genero;
    listarEventos(params)
      .then((data) => {
        if (peticion === ultimaPeticionRef.current) setEventos(data.results ?? []);
      })
      .catch(() => {
        if (peticion === ultimaPeticionRef.current) setError('No se pudieron cargar los eventos.');
      })
      .finally(() => {
        if (peticion === ultimaPeticionRef.current) setLoading(false);
      });
  }, [anio, mes, ciudad, genero]);

  const eventosPorDia = useMemo(() => agruparPorDia(eventos), [eventos]);
  const visibles = diaSeleccionado ? eventosPorDia.get(diaSeleccionado) ?? [] : eventos;

  const moverMes = (delta) => {
    const fecha = new Date(anio, mes + delta, 1);
    setAnio(fecha.getFullYear());
    setMes(fecha.getMonth());
    setDiaSeleccionado(null);
  };

  return (
    <main className={styles.page}>
      <PageHeader
        title="Eventos"
        subtitle="Conciertos, jams y actuaciones cerca de ti."
        actions={
          <Button to="/eventos/crear" variant="primary" size="sm">
            Publicar evento
          </Button>
        }
      />

      <div className={styles.filtros}>
        <div className={styles.select}>
          <Select value={ciudad} onChange={(e) => setCiudad(e.target.value)} aria-label="Filtrar eventos por ciudad">
            <option value="">Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c.ciudad_id} value={c.ciudad_id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.select}>
          <Select value={genero} onChange={(e) => setGenero(e.target.value)} aria-label="Filtrar eventos por estilo">
            <option value="">Todos los estilos</option>
            {generos.map((g) => (
              <option key={g.genero_musical_id} value={g.genero_musical_id}>
                {g.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className={styles.layout}>
        <CalendarioMes
          anio={anio}
          mes={mes}
          eventosPorDia={eventosPorDia}
          diaSeleccionado={diaSeleccionado}
          onSeleccionarDia={setDiaSeleccionado}
          onMesAnterior={() => moverMes(-1)}
          onMesSiguiente={() => moverMes(1)}
        />

        <section className={styles.lista}>
          {loading && (
            <div className={styles.stateBox}>
              <Spinner size="lg" aria-label="Cargando eventos" />
            </div>
          )}
          {!loading && error && <EmptyState icon="⚠️" title="No se pudo cargar" description={error} />}
          {!loading && !error && visibles.length === 0 && (
            <EmptyState
              icon="📅"
              title={diaSeleccionado ? 'No hay eventos este día' : 'No hay eventos este mes'}
              description="Prueba otro mes o quita los filtros. ¿Organizas algo? Publícalo."
            />
          )}
          {!loading && !error && visibles.length > 0 && (
            <ul className={styles.eventos} aria-label="Eventos">
              {visibles.map((e) => (
                <li key={e.evento_id}>
                  <EventoCard evento={e} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
