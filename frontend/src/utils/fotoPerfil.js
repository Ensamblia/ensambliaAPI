// src/utils/fotoPerfil.js
// Subida de la foto de perfil (PerfilPage): presigned → PUT a MinIO → set-avatar.
import { parseApiError } from '@/api/axios';

// Mensaje para el usuario según el paso de la subida que ha fallado
export function mensajeErrorFoto(paso, err) {
  if (paso === 'enviar') {
    return 'No se pudo enviar la imagen al almacenamiento de archivos. Inténtalo de nuevo en un momento.';
  }
  if (!err?.response) return 'No hay conexión con el servidor. Inténtalo de nuevo.';
  if (paso === 'preparar') return parseApiError(err, 'No se pudo preparar la subida de la foto.');
  return parseApiError(err, 'La imagen se subió, pero no se pudo guardar en tu perfil.');
}
