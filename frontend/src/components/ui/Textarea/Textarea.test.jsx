// src/components/ui/Textarea/Textarea.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renderiza un <textarea>', () => {
    render(<Textarea aria-label="Comentario" />);
    const ta = screen.getByRole('textbox', { name: 'Comentario' });
    expect(ta.tagName).toBe('TEXTAREA');
  });

  it('acepta value y onChange controlado', async () => {
    let value = '';
    const handleChange = (e) => { value = e.target.value; };
    const user = userEvent.setup();
    render(<Textarea aria-label="Cuerpo" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox', { name: 'Cuerpo' }), 'texto largo');
    expect(value).toBe('texto largo');
  });

  it('respeta disabled', () => {
    render(<Textarea aria-label="No" disabled />);
    expect(screen.getByRole('textbox', { name: 'No' })).toBeDisabled();
  });
});