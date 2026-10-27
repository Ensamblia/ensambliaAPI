// src/utils/tipoPerfil.js
// Tipos de perfil que acepta el backend (Perfil.TipoPerfil en apps/perfiles/models.py).

export const TIPOS_PERFIL = [
  { value: 'usuario', label: 'Músico' },
  { value: 'grupo', label: 'Grupo' },
  { value: 'local', label: 'Local' },
];

export function etiquetaTipoPerfil(tipo) {
  return TIPOS_PERFIL.find((t) => t.value === tipo)?.label ?? 'Músico';
}

// Solo el perfil personal lleva apellido; un grupo o un local no lo tiene.
export function llevaApellido(tipo) {
  return !tipo || tipo === 'usuario';
}
