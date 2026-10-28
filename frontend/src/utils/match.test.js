import { describe, it, expect } from 'vitest';
import { OPCIONES_BUSCO, motivosAnuncio, motivosMatch } from './match';

describe('match', () => {
  it('ofrece las cuatro búsquedas', () => {
    expect(OPCIONES_BUSCO.map((o) => o.value)).toEqual(['musico', 'grupo', 'ensayo', 'tocar', 'anuncios']);
  });

  it('explica por qué encaja un músico', () => {
    expect(
      motivosMatch({
        tipo: 'usuario', zona: 'Madrid', misma_comarca: true,
        generos_comunes: ['Punk', 'Rock'], instrumentos: ['Batería'], local: null,
      }),
    ).toEqual(['En tu comarca (Madrid)', 'Comparte Punk y Rock', 'Toca Batería']);
  });

  it('para un local lejano enseña su ciudad y sus tipos', () => {
    expect(
      motivosMatch({
        tipo: 'local', zona: 'Talavera', misma_comarca: false,
        generos_comunes: [], instrumentos: [], local: { tipos: ['sala', 'bar'], aforo: 200 },
      }),
    ).toEqual(['Talavera', 'Sala de conciertos, Bar', 'Aforo: 200']);
  });

  it('sin zona ni coincidencias no inventa motivos', () => {
    expect(
      motivosMatch({ tipo: 'grupo', zona: null, misma_comarca: false, generos_comunes: [], instrumentos: [], local: null }),
    ).toEqual([]);
  });

  it('motivosAnuncio explica por qué un anuncio es para ti', () => {
    expect(
      motivosAnuncio({ busca_mi_instrumento: true, instrumento: 'Batería', misma_comarca: false, zona: 'Toledo', generos_comunes: ['Rock'] }),
    ).toEqual(['Busca tu instrumento (Batería)', 'Toledo', 'Comparte Rock']);
  });
});
