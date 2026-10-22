// src/components/ui/Card/Card.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renderiza un div por defecto con children', () => {
    render(<Card>Contenido</Card>);
    const card = screen.getByText('Contenido');
    expect(card.tagName).toBe('DIV');
  });

  it('respeta as="article"', () => {
    render(<Card as="article">Post</Card>);
    const card = screen.getByText('Post');
    expect(card.tagName).toBe('ARTICLE');
  });

  it('interactive dispara onClick', async () => {
    let clicked = false;
    const user = userEvent.setup();
    render(
      <Card interactive onClick={() => { clicked = true; }}>
        Click
      </Card>,
    );
    await user.click(screen.getByText('Click'));
    expect(clicked).toBe(true);
  });

  it('aplica clases de elevación y padding', () => {
    render(<Card elevation="raised" padding="md">X</Card>);
    const card = screen.getByText('X');
    expect(card.className).toMatch(/raised/);
    expect(card.className).toMatch(/paddingMd/);
  });
});