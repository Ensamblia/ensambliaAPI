import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PreciosPage } from './PreciosPage';

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <PreciosPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

function tarjeta(nombre) {
  return screen.getByRole('heading', { name: nombre }).closest('article');
}

describe('PreciosPage', () => {
  beforeEach(() => localStorage.clear());

  it('muestra los tres planes con sus precios mensuales', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Free' })).toBeInTheDocument();
    expect(within(tarjeta('Basic')).getByText('4,99 €')).toBeInTheDocument();
    expect(within(tarjeta('Premium')).getByText('9,99 €')).toBeInTheDocument();
  });

  it('marca Basic como recomendado', () => {
    renderPage();
    expect(within(tarjeta('Basic')).getByText('Recomendado')).toBeInTheDocument();
    expect(within(tarjeta('Premium')).queryByText('Recomendado')).not.toBeInTheDocument();
  });

  it('enseña la ventaja de mensajes directos en Basic', () => {
    renderPage();
    expect(within(tarjeta('Basic')).getByText(/mensajes directos/i)).toBeInTheDocument();
  });

  it('al cambiar a anual muestra los precios anuales', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Anual' }));
    expect(within(tarjeta('Basic')).getByText('49,90 €')).toBeInTheDocument();
    expect(within(tarjeta('Premium')).getByText('99,90 €')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anual' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('en beta abierta los planes de pago son gratis y no hay botones bloqueados', () => {
    renderPage();
    expect(screen.getByText('Beta abierta')).toBeInTheDocument();
    for (const nombre of ['Basic', 'Premium']) {
      expect(within(tarjeta(nombre)).getByText(/Gratis durante la beta/i)).toBeInTheDocument();
      expect(within(tarjeta(nombre)).queryByRole('button')).not.toBeInTheDocument();
    }
  });

  it('sin sesión, el plan Free invita a crear cuenta', () => {
    renderPage();
    const enlace = within(tarjeta('Free')).getByRole('link', { name: /Crear cuenta gratis/i });
    expect(enlace).toHaveAttribute('href', '/register');
  });

  it('con sesión, el plan Free aparece como plan actual', () => {
    localStorage.setItem('ensamblia_token', 'tok');
    localStorage.setItem('ensamblia_usuario', JSON.stringify({ usuario: 'ana', usuario_id: 1 }));
    renderPage();
    expect(within(tarjeta('Free')).getByText('Tu plan actual')).toBeInTheDocument();
  });
});
