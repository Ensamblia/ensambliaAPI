// src/components/chat/ConversationItem.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationItem } from './ConversationItem';

describe('ConversationItem', () => {
  it('renderiza nombre, preview y avatar', () => {
    render(<ConversationItem nombre="Luis Flotu" preview="Hola" />);
    expect(screen.getByText('Luis Flotu')).toBeInTheDocument();
    expect(screen.getByText('Hola')).toBeInTheDocument();
    // Avatar con inicial L
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('muestra badge si unread > 0', () => {
    render(<ConversationItem nombre="Luis" preview="Hola" unread={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('no muestra badge si unread = 0', () => {
    render(<ConversationItem nombre="Luis" preview="Hola" unread={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('click dispara onClick', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<ConversationItem nombre="Luis" preview="Hola" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});