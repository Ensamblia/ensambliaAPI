// src/pages/NotFoundPage.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renderiza el 404 y el botón de volver', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Error 404/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /no encontrada/i })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Volver al inicio/i });
    expect(link).toHaveAttribute('href', '/');
  });
});