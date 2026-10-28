import { describe, it, expect } from 'vitest';
import { TIPOS_LOCAL, TIPOS_PARA_TOCAR, etiquetaTipoLocal, textoAfinidad } from './tipoLocal';

describe('tipoLocal', () => {
  it('lista los cinco tipos que acepta el backend', () => {
    expect(TIPOS_LOCAL.map((t) => t.value)).toEqual(['ensayo', 'sala', 'bar', 'teatro', 'otro']);
  });

  it('da la etiqueta legible de cada tipo', () => {
    expect(etiquetaTipoLocal('sala')).toBe('Sala de conciertos');
    expect(etiquetaTipoLocal('teatro')).toBe('Teatro / auditorio');
  });

  it('devuelve el valor tal cual si el tipo no se conoce', () => {
    expect(etiquetaTipoLocal('raro')).toBe('raro');
  });

  it('para tocar sirven todos menos ensayo', () => {
    expect(TIPOS_PARA_TOCAR).toEqual(['sala', 'bar', 'teatro', 'otro']);
  });

  it('textoAfinidad junta comarca y estilos en común', () => {
    expect(textoAfinidad({ misma_comarca: true, generos_comunes: 2 })).toBe('En tu comarca · 2 estilos en común');
    expect(textoAfinidad({ misma_comarca: true, generos_comunes: 1 })).toBe('En tu comarca · 1 estilo en común');
    expect(textoAfinidad({ misma_comarca: false, generos_comunes: 3 })).toBe('3 estilos en común');
    expect(textoAfinidad({ misma_comarca: true, generos_comunes: 0 })).toBe('En tu comarca');
  });

  it('textoAfinidad vacío si no hay afinidad o no se calculó', () => {
    expect(textoAfinidad({ misma_comarca: false, generos_comunes: 0 })).toBe('');
    expect(textoAfinidad({ misma_comarca: null, generos_comunes: null })).toBe('');
  });
});
