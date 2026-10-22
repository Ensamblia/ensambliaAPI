// src/components/ui/Input/Input.test.jsx
import React, { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renderiza un <input> con type text por defecto', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('acepta type password', () => {
    render(<Input type="password" />);
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('acepta value y onChange controlado', async () => {
    let value = '';
    const handleChange = (e) => { value = e.target.value; };
    const user = userEvent.setup();
    render(<Input onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'hola');
    expect(value).toBe('hola');
  });

  it('respeta disabled', async () => {
    const user = userEvent.setup();
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    await user.type(input, 'x');
    expect(input.value).toBe('');
  });

  it('expone ref al elemento nativo', () => {
    const ref = createRef();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});