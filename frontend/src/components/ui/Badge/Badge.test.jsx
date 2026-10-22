// src/components/ui/Badge/Badge.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('no renderiza nada si value <= 0', () => {
    const { container } = render(<Badge value={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra el número', () => {
    render(<Badge value={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('muestra max+ si supera el máximo', () => {
    render(<Badge value={150} max={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('tiene aria-label descriptivo', () => {
    render(<Badge value={5} />);
    expect(screen.getByLabelText('5 sin leer')).toBeInTheDocument();
  });

  it('aplica clase de variante', () => {
    render(<Badge value={2} variant="accent" />);
    expect(screen.getByText('2').className).toMatch(/accent/);
  });
});