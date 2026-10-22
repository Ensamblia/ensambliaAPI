// src/components/ui/Select/Select.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  it('renderiza un <select> con opciones', () => {
    render(
      <Select aria-label="Tipo">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Tipo' });
    expect(select.tagName).toBe('SELECT');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('permite cambiar el valor', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select aria-label="Tipo" onChange={handleChange}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo' }), 'b');
    expect(handleChange).toHaveBeenCalled();
  });

  it('respeta disabled', () => {
    render(
      <Select aria-label="No" disabled>
        <option>X</option>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'No' })).toBeDisabled();
  });
});