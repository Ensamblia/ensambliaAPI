import { describe, it, expect } from 'vitest';
import { PLANES, precioPlan } from './planes';

describe('planes', () => {
  it('hay tres planes: free, basic y premium', () => {
    expect(PLANES.map((p) => p.id)).toEqual(['free', 'basic', 'premium']);
  });

  it('basic es el recomendado', () => {
    expect(PLANES.filter((p) => p.recomendado).map((p) => p.id)).toEqual(['basic']);
  });

  it('cada plan tiene al menos tres ventajas', () => {
    PLANES.forEach((p) => expect(p.ventajas.length).toBeGreaterThanOrEqual(3));
  });

  it('precioPlan formatea mensual y anual en euros', () => {
    const basic = PLANES.find((p) => p.id === 'basic');
    expect(precioPlan(basic, 'mensual')).toEqual({ importe: '4,99 €', periodo: '/mes' });
    expect(precioPlan(basic, 'anual')).toEqual({ importe: '49,90 €', periodo: '/año' });
  });

  it('el plan gratuito se muestra como 0 € en cualquier periodo', () => {
    const free = PLANES.find((p) => p.id === 'free');
    expect(precioPlan(free, 'anual')).toEqual({ importe: '0 €', periodo: 'para siempre' });
  });
});
