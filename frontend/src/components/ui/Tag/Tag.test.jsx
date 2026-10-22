// src/components/ui/Tag/Tag.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tag } from './Tag';

describe('Tag', () => {
  it('renderiza un span con children', () => {
    render(<Tag>Rock</Tag>);
    const tag = screen.getByText('Rock');
    expect(tag.tagName).toBe('SPAN');
  });

  it('aplica clase de color y tamaño', () => {
    render(<Tag color="green" size="sm">Jazz</Tag>);
    const tag = screen.getByText('Jazz');
    expect(tag.className).toMatch(/green/);
    expect(tag.className).toMatch(/sm/);
  });
});