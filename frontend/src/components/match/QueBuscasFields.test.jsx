import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueBuscasFields } from './QueBuscasFields';
import { QUE_BUSCAS_VACIO, hayQueBuscas } from '@/utils/match';

function Contenedor({ onCambio }) {
  const [valor, setValor] = useState(QUE_BUSCAS_VACIO);
  return (
    <QueBuscasFields
      value={valor}
      onChange={(v) => {
        setValor(v);
        onCambio(v);
      }}
    />
  );
}

describe('QueBuscasFields', () => {
  it('permite elegir tipo, instrumento y estilos', async () => {
    const cambios = [];
    const user = userEvent.setup();
    render(<Contenedor onCambio={(v) => cambios.push(v)} />);
    await screen.findByRole('option', { name: 'Guitarra' });
    await user.selectOptions(screen.getByLabelText(/Qué tipo de perfil buscas/i), 'usuario');
    await user.selectOptions(screen.getByLabelText(/Instrumento que buscas/i), '1');
    await user.click(await screen.findByLabelText('Rock'));
    expect(cambios[cambios.length - 1]).toEqual({ tipo_perfil: 'usuario', instrumento_id: '1', generos: [1] });
  });

  it('hayQueBuscas solo es cierto si se rellenó algo', () => {
    expect(hayQueBuscas(QUE_BUSCAS_VACIO)).toBe(false);
    expect(hayQueBuscas({ ...QUE_BUSCAS_VACIO, generos: [2] })).toBe(true);
    expect(hayQueBuscas({ ...QUE_BUSCAS_VACIO, tipo_perfil: 'grupo' })).toBe(true);
  });
});
