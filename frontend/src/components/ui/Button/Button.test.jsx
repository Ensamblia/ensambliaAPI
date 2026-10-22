// src/components/ui/Button/Button.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Button } from './Button';

function renderInRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Button', () => {
  it('renderiza un <button> por defecto con el texto', () => {
    render(<Button>Guardar</Button>);
    const btn = screen.getByRole('button', { name: 'Guardar' });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('llama a onClick al hacer click', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Pulsa</Button>);
    await user.click(screen.getByRole('button', { name: 'Pulsa' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respeta disabled: no dispara onClick', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick} disabled>No</Button>);
    const btn = screen.getByRole('button', { name: 'No' });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('con loading: aria-busy y no dispara onClick', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick} loading>Guardando</Button>);
    const btn = screen.getByRole('button', { name: 'Guardando' });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('con to: renderiza un enlace de react-router', () => {
    renderInRouter(<Button to="/perfil">Mi perfil</Button>);
    const link = screen.getByRole('link', { name: 'Mi perfil' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/perfil');
  });

  it('con href: renderiza un <a>', () => {
    render(<Button href="https://example.com">Externo</Button>);
    const link = screen.getByRole('link', { name: 'Externo' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('aplica clases de variante y tamaño', () => {
    render(<Button variant="danger" size="lg">Borrar</Button>);
    const btn = screen.getByRole('button', { name: 'Borrar' });
    // CSS Modules genera nombres hasheados, así que comprobamos que el
    // className contiene las clases de la variante y el tamaño.
    expect(btn.className).toMatch(/danger/);
    expect(btn.className).toMatch(/lg/);
  });

  it('renderiza leftIcon y rightIcon', () => {
    render(
      <Button leftIcon={<span data-testid="left" />} rightIcon={<span data-testid="right" />}>
        Con iconos
      </Button>,
    );
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('block aplica clase de ancho completo', () => {
    render(<Button block>Ancho</Button>);
    const btn = screen.getByRole('button', { name: 'Ancho' });
    expect(btn.className).toMatch(/block/);
  });
});