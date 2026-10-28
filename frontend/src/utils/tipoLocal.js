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
