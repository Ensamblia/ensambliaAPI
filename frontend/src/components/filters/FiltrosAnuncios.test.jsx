// src/components/filters/FiltrosAnuncios.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiltrosAnuncios } from './FiltrosAnuncios';

describe('FiltrosAnuncios', () => {
  it('renderiza búsqueda, tipo y ordenación', () => {
    render(<FiltrosAnuncios onFilter={() => {}} />);

    expect(
      screen.getByRole('searchbox', { name: /Buscar anuncios/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /Filtrar por tipo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /Ordenar anuncios/i }),
    ).toBeInTheDocument();
  });

  it('emite el filtro inicial al montar', async () => {
    const onFilter = vi.fn();
    render(<FiltrosAnuncios onFilter={onFilter} />);
    await waitFor(() => {
      expect(onFilter).toHaveBeenCalledWith({
        busqueda: '',
        tipo_anuncio: '',
        ordering: '-fecha_publicacion',
      });
    });
  });

  it('emite cambio al escribir en la búsqueda', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(<FiltrosAnuncios onFilter={onFilter} />);
    await user.type(screen.getByRole('searchbox', { name: /Buscar anuncios/i }), 'guitarra');
    await waitFor(() => {
      expect(onFilter).toHaveBeenLastCalledWith(
        expect.objectContaining({ busqueda: 'guitarra' }),
      );
    });
  });

  it('emite cambio al seleccionar ordenación', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(<FiltrosAnuncios onFilter={onFilter} />);
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Ordenar anuncios/i }),
      'titulo',
    );
    await waitFor(() => {
      expect(onFilter).toHaveBeenLastCalledWith(
        expect.objectContaining({ ordering: 'titulo' }),
      );
    });
  });

  it('muestra "Limpiar" cuando hay filtros activos', async () => {
    const user = userEvent.setup();
    render(<FiltrosAnuncios onFilter={() => {}} />);

    // Sin filtros, no debe aparecer
    expect(screen.queryByRole('button', { name: /Limpiar/i })).not.toBeInTheDocument();

    // Al escribir, aparece
    await user.type(screen.getByRole('searchbox', { name: /Buscar anuncios/i }), 'x');
    expect(screen.getByRole('button', { name: /Limpiar/i })).toBeInTheDocument();
  });

  it('"Limpiar" resetea los filtros al estado inicial', async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(<FiltrosAnuncios onFilter={onFilter} />);

    await user.type(screen.getByRole('searchbox', { name: /Buscar anuncios/i }), 'x');
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Ordenar anuncios/i }),
      'titulo',
    );

    await user.click(screen.getByRole('button', { name: /Limpiar/i }));

    await waitFor(() => {
      expect(onFilter).toHaveBeenLastCalledWith({
        busqueda: '',
        tipo_anuncio: '',
        ordering: '-fecha_publicacion',
      });
    });
  });

  it('el botón Filtros cuenta los filtros del panel, no la búsqueda', async () => {
    const user = userEvent.setup();
    render(<FiltrosAnuncios onFilter={() => {}} />);
    expect(screen.queryByLabelText(/activos/)).not.toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: /Buscar anuncios/i }), 'batería');
    expect(screen.queryByLabelText(/activos/)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: /Ordenar anuncios/i }), 'titulo');
    expect(screen.getByLabelText('1 activos')).toBeInTheDocument();
  });
});
