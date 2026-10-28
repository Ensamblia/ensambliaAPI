// src/utils/tipoPerfil.test.js
import { describe, it, expect } from 'vitest';
import { etiquetaTipoPerfil, llevaApellido } from './tipoPerfil';

describe('tipoPerfil', () => {
  it('traduce cada tipo a su etiqueta', () => {
    expect(etiquetaTipoPerfil('usuario')).toBe('Músico');
    expect(etiquetaTipoPerfil('grupo')).toBe('Grupo');
    expect(etiquetaTipoPerfil('local')).toBe('Local');
  });

  it('un tipo ausente o desconocido se muestra como músico', () => {
    expect(etiquetaTipoPerfil(undefined)).toBe('Músico');
    expect(etiquetaTipoPerfil('otro')).toBe('Músico');
  });

  it('solo el perfil personal lleva apellido', () => {
    expect(llevaApellido('usuario')).toBe(true);
    expect(llevaApellido(undefined)).toBe(true);
    expect(llevaApellido('grupo')).toBe(false);
    expect(llevaApellido('local')).toBe(false);
  });
});
