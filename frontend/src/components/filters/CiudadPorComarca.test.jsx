import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CiudadPorComarca } from './CiudadPorComarca';

const COMARCAS = [
  { comarca_id: 1, nombre: 'Osona' },
  { comarca_id: 2, nombre: 'Vallès Occidental' },
];
const CIUDADES = [
  { ciudad_id: 10, nombre: 'Vic', comarca_id: 1 },
  { ciudad_id: 11, nombre: 'Manlleu', comarca_id: 1 },
  { ciudad_id: 20, nombre: 'Sabadell', comarca_id: 2 },
];

function Contenedor({ inicial = '' }) {
  const [ciudad, setCiudad] = useState(inicial);
  return (
    <>
      <CiudadPorComarca ciudades={CIUDADES} comarcas={COMARCAS} value={ciudad} onChange={setCiudad} />
      <output>{ciudad || 'sin ciudad'}</output>
    </>
  );
}

const nombresCiudades = () =>
  within(screen.getByLabelText('Ciudad')).getAllByRole('option').map((o) => o.textContent).slice(1);

describe('CiudadPorComarca', () => {
  it('al elegir comarca solo ofrece sus ciudades', async () => {
    const user = userEvent.setup();
    render(<Contenedor />);
    expect(nombresCiudades()).toEqual(['Vic', 'Manlleu', 'Sabadell']);
    await user.selectOptions(screen.getByLabelText('Comarca'), '1');
    expect(nombresCiudades()).toEqual(['Vic', 'Manlleu']);
  });

  it('al editar, parte de la comarca de la ciudad guardada', () => {
    render(<Contenedor inicial="20" />);
    expect(screen.getByLabelText('Comarca')).toHaveValue('2');
    expect(nombresCiudades()).toEqual(['Sabadell']);
  });

  it('si se cambia a otra comarca, se vacía la ciudad elegida', async () => {
    const user = userEvent.setup();
    render(<Contenedor inicial="20" />);
    await user.selectOptions(screen.getByLabelText('Comarca'), '1');
    expect(screen.getByText('sin ciudad')).toBeInTheDocument();
  });
});
