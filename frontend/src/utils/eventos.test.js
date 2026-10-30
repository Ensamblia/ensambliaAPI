import { describe, it, expect } from 'vitest';
import { agruparPorDia, claveDia, fechaYHoraInputs, rangoMes, semanasDelMes, nombreMes } from './eventos';

describe('eventos (fechas)', () => {
  it('semanasDelMes empieza en lunes y rellena con null', () => {
    // Noviembre de 2026 empieza en domingo
    const semanas = semanasDelMes(2026, 10);
    expect(semanas[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(semanas.flat().filter(Boolean)).toHaveLength(30);
    semanas.forEach((s) => expect(s).toHaveLength(7));
  });

  it('claveDia usa la fecha local', () => {
    expect(claveDia(new Date(2026, 10, 7, 23, 30))).toBe('2026-11-07');
  });

  it('rangoMes cubre del primer al último instante del mes', () => {
    const { desde, hasta } = rangoMes(2026, 10);
    expect(new Date(desde).getTime()).toBe(new Date(2026, 10, 1, 0, 0, 0).getTime());
    expect(new Date(hasta).getTime()).toBe(new Date(2026, 10, 30, 23, 59, 59, 999).getTime());
  });

  it('agruparPorDia agrupa eventos por su día local', () => {
    const a = { evento_id: 1, fecha_inicio: new Date(2026, 10, 7, 21).toISOString() };
    const b = { evento_id: 2, fecha_inicio: new Date(2026, 10, 7, 23).toISOString() };
    const c = { evento_id: 3, fecha_inicio: new Date(2026, 10, 8, 12).toISOString() };
    const grupos = agruparPorDia([a, b, c]);
    expect(grupos.get('2026-11-07').map((e) => e.evento_id)).toEqual([1, 2]);
    expect(grupos.get('2026-11-08').map((e) => e.evento_id)).toEqual([3]);
  });

  it('nombreMes en castellano', () => {
    expect(nombreMes(2026, 10)).toBe('noviembre de 2026');
  });
});

describe('fechaYHoraInputs', () => {
  it('devuelve la fecha y la hora locales para los inputs', () => {
    const iso = new Date(2030, 0, 5, 9, 7).toISOString();
    expect(fechaYHoraInputs(iso)).toEqual({ fecha: '2030-01-05', hora: '09:07' });
  });
});
