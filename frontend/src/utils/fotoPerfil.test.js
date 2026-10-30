import { describe, it, expect } from 'vitest';
import { mensajeErrorFoto } from './fotoPerfil';

const conRespuesta = (data, status = 400) => ({ response: { status, data } });

describe('mensajeErrorFoto', () => {
  it('si falla el envío a MinIO habla del almacenamiento', () => {
    expect(mensajeErrorFoto('enviar', new Error('Error al subir: 403'))).toMatch(/almacenamiento de archivos/);
  });

  it('sin respuesta del servidor habla de la conexión', () => {
    expect(mensajeErrorFoto('preparar', new Error('Network Error'))).toMatch(/No hay conexión con el servidor/);
  });

  it('al preparar la subida usa el motivo del backend', () => {
    expect(mensajeErrorFoto('preparar', conRespuesta({ error: 'Solo se aceptan imágenes para la foto de perfil' })))
      .toBe('Solo se aceptan imágenes para la foto de perfil');
  });

  it('al guardar sin motivo del backend avisa de que la imagen sí se subió', () => {
    expect(mensajeErrorFoto('guardar', conRespuesta({}, 500))).toMatch(/La imagen se subió/);
  });
});
