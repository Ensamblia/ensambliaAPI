// src/utils/match.js
// Qué se puede buscar en /match y cómo se explica cada sugerencia.
import { etiquetaTipoLocal } from './tipoLocal';

export const OPCIONES_BUSCO = [
  { value: 'musico', label: 'Busco músico' },
  { value: 'grupo', label: 'Busco grupo' },
  { value: 'ensayo', label: 'Busco local de ensayo' },
  { value: 'tocar', label: 'Busco local para tocar' },
  { value: 'anuncios', label: 'Anuncios para mí' },
];

function enumerar(lista) {
  if (lista.length <= 1) return lista.join('');
  return `${lista.slice(0, -1).join(', ')} y ${lista[lista.length - 1]}`;
}

// Motivos legibles de un match devuelto por GET /api/match/
export function motivosMatch({ zona, misma_comarca, generos_comunes, instrumentos, local }) {
  const motivos = [];
  if (misma_comarca && zona) motivos.push(`En tu comarca (${zona})`);
  else if (zona) motivos.push(zona);
  if (generos_comunes?.length) motivos.push(`Comparte ${enumerar(generos_comunes)}`);
  if (instrumentos?.length) motivos.push(`Toca ${enumerar(instrumentos)}`);
  if (local) {
    motivos.push(local.tipos.map(etiquetaTipoLocal).join(', '));
    if (local.aforo != null) motivos.push(`Aforo: ${local.aforo}`);
  }
  return motivos;
}

// Motivos de un anuncio devuelto por GET /api/match/?busco=anuncios
export function motivosAnuncio({ busca_mi_instrumento, instrumento, misma_comarca, zona, generos_comunes }) {
  const motivos = [];
  if (busca_mi_instrumento && instrumento) motivos.push(`Busca tu instrumento (${instrumento})`);
  if (misma_comarca && zona) motivos.push(`En tu comarca (${zona})`);
  else if (zona) motivos.push(zona);
  if (generos_comunes?.length) motivos.push(`Comparte ${enumerar(generos_comunes)}`);
  return motivos;
}

// "¿Qué buscas?" de un anuncio: estado del formulario y payload para la API
export const QUE_BUSCAS_VACIO = { tipo_perfil: '', instrumento_id: '', generos: [] };

export function hayQueBuscas({ tipo_perfil, instrumento_id, generos }) {
  return Boolean(tipo_perfil || instrumento_id || generos.length);
}

export function payloadQueBuscas({ tipo_perfil, instrumento_id, generos }) {
  return {
    tipo_perfil: tipo_perfil || null,
    instrumento_id: instrumento_id ? Number(instrumento_id) : null,
    generos,
  };
}
