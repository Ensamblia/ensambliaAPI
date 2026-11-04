import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PanelFiltros } from './PanelFiltros';

function renderPanel(props = {}) {
  return render(
    <PanelFiltros {...props}>
      <select aria-label="Ciudad">
        <option>Todas</option>
      </select>
    </PanelFiltros>,
  );
}

describe('PanelFiltros', () => {
  it('muestra los filtros dentro del panel', () => {
    renderPanel();
    const panel = document.getElementById(screen.getByRole('button', { name: /Filtros/ }).getAttribute('aria-controls'));
    expect(panel).toContainElement(screen.getByLabelText('Ciudad'));
  });

  it('el botón abre y cierra el panel', async () => {
    renderPanel();
    const boton = screen.getByRole('button', { name: /Filtros/ });
    const panel = document.getElementById(boton.getAttribute('aria-controls'));
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(panel.className).not.toMatch(/panelAbierto/);

    await userEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(panel.className).toMatch(/panelAbierto/);

    await userEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'false');
  });

  it('indica cuántos filtros hay activos', () => {
    renderPanel({ activos: 2 });
    expect(screen.getByLabelText('2 activos')).toHaveTextContent('2');
  });

  it('sin filtros activos no muestra el contador', () => {
    renderPanel({ activos: 0 });
    expect(screen.queryByLabelText(/activos/)).not.toBeInTheDocument();
  });
});
