// src/components/ui/EmptyState/EmptyState.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renderiza título', () => {
    render(<EmptyState title="Sin resultados" />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('renderiza icono con aria-hidden', () => {
    render(<EmptyState icon="🔍" title="X" />);
    const icon = screen.getByText('🔍');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renderiza descripción si se pasa', () => {
    render(<EmptyState title="X" description="Prueba con otros filtros" />);
    expect(screen.getByText('Prueba con otros filtros')).toBeInTheDocument();
  });

  it('renderiza action si se pasa', () => {
    render(
      <EmptyState title="X" action={<button>Crear</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });

  it('sin description ni action no falla', () => {
    render(<EmptyState title="X" />);
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('compact aplica clase', () => {
    const { container } = render(<EmptyState title="X" compact />);
    expect(container.firstChild.className).toMatch(/compact/);
  });
});