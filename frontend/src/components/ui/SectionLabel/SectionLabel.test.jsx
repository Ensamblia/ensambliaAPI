// src/components/ui/SectionLabel/SectionLabel.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionLabel } from './SectionLabel';

describe('SectionLabel', () => {
  it('renderiza un div con children', () => {
    render(<SectionLabel>TODO EN UN MISMO LUGAR</SectionLabel>);
    const el = screen.getByText('TODO EN UN MISMO LUGAR');
    expect(el.tagName).toBe('DIV');
  });

  it('aplica clase de tono', () => {
    render(<SectionLabel tone="green">X</SectionLabel>);
    expect(screen.getByText('X').className).toMatch(/green/);
  });
});