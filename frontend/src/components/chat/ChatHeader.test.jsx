// src/components/chat/ChatHeader.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});