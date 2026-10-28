// src/utils/tipoLocal.js
// Tipos de local que acepta el backend (Local.TipoLocal en apps/locales/models.py).

export const TIPOS_LOCAL = [
  { value: 'ensayo', label: 'Ensayo' },
  { value: 'sala', label: 'Sala de conciertos' },
  { value: 'bar', label: 'Bar' },
  { value: 'teatro', label: 'Teatro / auditorio' },
  { value: 'otro', label: 'Otro' },
];

// Sitios donde se puede tocar en directo (todo menos sala de ensayo).
export const TIPOS_PARA_TOCAR = ['sala', 'bar', 'teatro', 'otro'];

export function etiquetaTipoLocal(tipo) {
  return TIPOS_LOCAL.find((t) => t.value === tipo)?.label ?? tipo;
}

// Explica por qué un resultado sale arriba: "En tu comarca · 2 estilos en común".
export function textoAfinidad({ misma_comarca, generos_comunes }) {
  const partes = [];
  if (misma_comarca) partes.push('En tu comarca');
  if (generos_comunes > 0) {
    partes.push(`${generos_comunes} ${generos_comunes === 1 ? 'estilo' : 'estilos'} en común`);
  }
  return partes.join(' · ');
}

// Traduce el estado de los filtros a los query params de GET /api/locales/
export function paramsDesdeFiltros({ uso, comarca, aforo_min, genero, search } = {}) {
  const params = {};
  if (uso === 'ensayar') params.tipo = ['ensayo'];
  if (uso === 'tocar') params.tipo = TIPOS_PARA_TOCAR;
  if (comarca) params.comarca = comarca;
  if (aforo_min) params.aforo_min = aforo_min;
  if (genero) params.genero = genero;
  if (search?.trim()) params.search = search.trim();
  return params;
}
