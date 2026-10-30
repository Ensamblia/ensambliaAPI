// src/components/ui/PageHeader/PageHeader.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { PageHeader } from './PageHeader';

function renderInRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('PageHeader', () => {
  it('renderiza el título como h1', () => {
    renderInRouter(<PageHeader title="Anuncios" />);
    const h1 = screen.getByRole('heading', { level: 1, name: 'Anuncios' });
    expect(h1).toBeInTheDocument();
  });

  it('renderiza subtítulo si se pasa', () => {
    renderInRouter(
      <PageHeader title="Anuncios" subtitle="Encuentra músicos" />,
    );
    expect(screen.getByText('Encuentra músicos')).toBeInTheDocument();
  });

  it('no renderiza subtítulo si no se pasa', () => {
    renderInRouter(<PageHeader title="Anuncios" />);
    expect(screen.queryByText(/Encuentra/)).not.toBeInTheDocument();
  });

  it('renderiza actions', () => {
    renderInRouter(
      <PageHeader title="Anuncios" actions={<button>Crear</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });

  it('renderiza link de back si backTo', () => {
    renderInRouter(<PageHeader title="Detalle" backTo="/anuncios" />);
    const link = screen.getByRole('link', { name: /Volver/ });
    expect(link).toHaveAttribute('href', '/anuncios');
  });

  it('permite customizar backLabel', () => {
    renderInRouter(
      <PageHeader title="Detalle" backTo="/anuncios" backLabel="Anuncios" />,
    );
    expect(screen.getByRole('link', { name: /Anuncios/ })).toBeInTheDocument();
  });

  it('con backHistory vuelve a la página anterior si se llegó navegando', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/locales']}>
        <Routes>
          <Route path="/locales" element={<Link to="/perfiles/3">ir al perfil</Link>} />
          <Route path="/anuncios" element={<p>pantalla anuncios</p>} />
          <Route path="/perfiles/3" element={<PageHeader title="Perfil" backTo="/anuncios" backHistory />} />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(screen.getByText('ir al perfil'));
    await user.click(screen.getByRole('link', { name: /Volver/ }));
    expect(screen.getByText('ir al perfil')).toBeInTheDocument();
  });

  it('con backHistory y entrada directa por URL usa backTo', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/perfiles/3']}>
        <Routes>
          <Route path="/anuncios" element={<p>pantalla anuncios</p>} />
          <Route path="/perfiles/3" element={<PageHeader title="Perfil" backTo="/anuncios" backHistory />} />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: /Volver/ }));
    expect(screen.getByText('pantalla anuncios')).toBeInTheDocument();
  });
});

