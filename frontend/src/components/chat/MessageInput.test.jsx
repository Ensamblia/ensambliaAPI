// src/components/chat/MessageInput.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from './MessageInput';

describe('MessageInput', () => {
  it('renderiza input y botón enviar', () => {
    render(<MessageInput value="" onChange={() => {}} onSend={() => {}} />);
    expect(screen.getByLabelText('Escribir mensaje')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar/i })).toBeInTheDocument();
  });

  it('Enter envía', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput value="Hola" onChange={() => {}} onSend={onSend} />);
    await user.type(screen.getByLabelText('Escribir mensaje'), '{Enter}');
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('click en Enviar llama onSend', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput value="Hola" onChange={() => {}} onSend={onSend} />);
    await user.click(screen.getByRole('button', { name: /Enviar/i }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('muestra chips de adjuntos pendientes', () => {
    render(
      <MessageInput
        value=""
        onChange={() => {}}
        onSend={() => {}}
        adjuntosPendientes={[{ adjunto_id: 1, nombre: 'foto.jpg' }]}
        onQuitarAdjunto={() => {}}
      />,
    );
    expect(screen.getByText('foto.jpg')).toBeInTheDocument();
  });

  it('click en × del chip llama onQuitarAdjunto', async () => {
    const onQuitar = vi.fn();
    const user = userEvent.setup();
    render(
      <MessageInput
        value=""
        onChange={() => {}}
        onSend={() => {}}
        adjuntosPendientes={[{ adjunto_id: 1, nombre: 'foto.jpg' }]}
        onQuitarAdjunto={onQuitar}
      />,
    );
    await user.click(screen.getByLabelText('Quitar foto.jpg'));
    expect(onQuitar).toHaveBeenCalledWith(1);
  });
});