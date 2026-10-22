// src/components/ui/Avatar/Avatar.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('muestra la inicial del nombre', () => {
    render(<Avatar name="Ana" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('con name accesible', () => {
    render(<Avatar name="Ana" />);
    expect(screen.getByLabelText('Ana')).toBeInTheDocument();
  });

  it('si hay src, renderiza imagen con alt', () => {
    render(<Avatar name="Ana" src="http://x/img.jpg" />);
    const img = screen.getByRole('img', { name: 'Ana' });
    expect(img).toHaveAttribute('src', 'http://x/img.jpg');
  });

  it('con icon si no hay name ni src', () => {
    render(<Avatar icon={<span data-testid="icon">★</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('mismo nombre → misma clase de tono', () => {
    const { container: a } = render(<Avatar name="Ana" />);
    const { container: b } = render(<Avatar name="Ana" />);
    const classesA = Array.from(a.querySelectorAll('span')).map((s) => s.className).join(' ');
    const classesB = Array.from(b.querySelectorAll('span')).map((s) => s.className).join(' ');
    // Buscamos el toneX en ambos
    const matchA = classesA.match(/tone\d/);
    const matchB = classesB.match(/tone\d/);
    expect(matchA).not.toBeNull();
    expect(matchA[0]).toBe(matchB[0]);
  });
});