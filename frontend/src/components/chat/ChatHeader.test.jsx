// src/components/chat/ChatHeader.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatHeader } from './ChatHeader';

describe('ChatHeader', () => {
  it('muestra nombre y estado "En línea"', () => {
    render(<ChatHeader nombre="Luis Flotu" wsConnected={true} otroOnline={true} />);
    expect(screen.getByText('Luis Flotu')).toBeInTheDocument();
    expect(screen.getByText('En línea')).toBeInTheDocument();
  });

  it('muestra "Desconectado" si wsConnected=false', () => {
    render(<ChatHeader nombre="Luis" wsConnected={false} otroOnline={true} />);
    expect(screen.getByText('Desconectado')).toBeInTheDocument();
  });

  it('muestra "Ausente" si conectado pero offline', () => {
    render(<ChatHeader nombre="Luis" wsConnected={true} otroOnline={false} />);
    expect(screen.getByText('Ausente')).toBeInTheDocument();
  });

  it('sin onBack no muestra el botón de volver', () => {
    render(<ChatHeader nombre="Luis" wsConnected={true} otroOnline={false} />);
    expect(screen.queryByRole('button', { name: /Volver a las conversaciones/i })).not.toBeInTheDocument();
  });

  it('con onBack, el botón de volver lo llama', async () => {
    const onBack = vi.fn();
    render(<ChatHeader nombre="Luis" wsConnected={true} otroOnline={false} onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: /Volver a las conversaciones/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
