// src/pages/MercadoPage.jsx
// Maqueta: compraventa de equipo entre músicos (datos de ejemplo, sin back).
import React, { useMemo, useState } from 'react';
import { Drum, Guitar, Heart, MapPin, Music, Piano, Plus, Search, SlidersHorizontal, Speaker, Store } from 'lucide-react';
import { Button, Chip, EmptyState, MuestraBadge, PageHeader, Select, Tag } from '@/components/ui';
import { ARTICULOS_MERCADO, CATEGORIAS_MERCADO } from '@/data/maquetas';
import styles from './MercadoPage.module.css';

const ICONOS = { guitar: Guitar, piano: Piano, drum: Drum, music: Music, speaker: Speaker, sliders: SlidersHorizontal };
const CATEGORIA = Object.fromEntries(CATEGORIAS_MERCADO.map((c) => [c.value, c]));

const ORDENES = {
  recientes: (a, b) => a.dias - b.dias,
  barato: (a, b) => a.precio - b.precio,
  caro: (a, b) => b.precio - a.precio,
};

export function MercadoPage() {
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [guardados, setGuardados] = useState(() => new Set([2]));
  const [soloGuardados, setSoloGuardados] = useState(false);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ARTICULOS_MERCADO.filter((a) => !categoria || a.categoria === categoria)
      .filter((a) => !soloGuardados || guardados.has(a.id))
      .filter((a) => !q || `${a.titulo} ${a.ciudad}`.toLowerCase().includes(q))
      .sort(ORDENES[orden]);
  }, [categoria, busqueda, orden, guardados, soloGuardados]);

  const alternarGuardado = (id) => {
    setGuardados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className={styles.page}>
      <PageHeader
        title="Mercado"
        icon={<Store size={22} />}
        tone="blue"
        badge={<MuestraBadge />}
        subtitle="Compra y vende instrumentos y equipo entre músicos, con recogida en mano."
        actions={
          <Button variant="primary" leftIcon={<Plus size={16} strokeWidth={2.5} />}>
            Vender algo
          </Button>
        }
      />

      <section className={styles.filtros}>
        <div className={styles.filtrosFila}>
          <label className={styles.buscador}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca guitarras, amplis, pedales…"
              aria-label="Buscar en el mercado"
            />
          </label>
          <div className={styles.orden}>
            <Select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
              <option value="recientes">Más recientes</option>
              <option value="barato">Precio: de menor a mayor</option>
              <option value="caro">Precio: de mayor a menor</option>
            </Select>
          </div>
        </div>
        <div className={styles.chips}>
          <Chip active={!categoria && !soloGuardados} onClick={() => { setCategoria(''); setSoloGuardados(false); }}>
            Todo
          </Chip>
          {CATEGORIAS_MERCADO.map((c) => (
            <Chip key={c.value} active={categoria === c.value} onClick={() => setCategoria(c.value)}>
              {c.label}
            </Chip>
          ))}
          <span className={styles.sep} aria-hidden="true" />
          <Chip active={soloGuardados} activeTone="yellow" onClick={() => setSoloGuardados((v) => !v)}>
            <Heart size={14} aria-hidden="true" /> Guardados
          </Chip>
        </div>
      </section>

      <p className={styles.contador}>
        {visibles.length} artículo{visibles.length !== 1 ? 's' : ''}
      </p>

      {visibles.length === 0 ? (
        <EmptyState icon="🎛️" title="Nada por aquí" description="Prueba otra categoría o quita la búsqueda." />
      ) : (
        <div className={styles.grid}>
          {visibles.map((a) => {
            const cat = CATEGORIA[a.categoria];
            const Icono = ICONOS[cat.icono];
            const guardado = guardados.has(a.id);
            return (
              <article key={a.id} className={styles.card}>
                <div className={[styles.media, styles[cat.tono]].join(' ')}>
                  <Icono size={52} strokeWidth={1.6} aria-hidden="true" />
                  <span className={styles.precio}>{a.precio} €</span>
                  <button
                    type="button"
                    className={[styles.fav, guardado ? styles.favOn : ''].join(' ')}
                    onClick={() => alternarGuardado(a.id)}
                    aria-pressed={guardado}
                    aria-label={guardado ? 'Quitar de guardados' : 'Guardar'}
                  >
                    <Heart size={17} fill={guardado ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className={styles.body}>
                  <div className={styles.tags}>
                    <Tag size="sm" color="blue">{cat.label}</Tag>
                    <Tag size="sm">{a.estado}</Tag>
                  </div>
                  <h3 className={styles.titulo}>{a.titulo}</h3>
                  <p className={styles.meta}>
                    <MapPin size={14} aria-hidden="true" />
                    {a.ciudad} · {a.vendedor}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
