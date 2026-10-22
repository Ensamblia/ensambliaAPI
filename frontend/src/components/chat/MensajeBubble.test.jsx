// src/components/chat/MensajeBubble.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MensajeBubble } from './MensajeBubble';

const mensajeBase = {
  mensaje_id: 1,
  contenido: 'Hola',
  esta_eliminado: false,
  esta_editado: false,
  adjuntos: [],
};

describe('MensajeBubble', () => {
  it('renderiza contenido', () => {
    render(<MensajeBubble mensaje={mensajeBase} esMio={false} />);
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });

  it('si es mío, muestra ✓/✓✓ y el menú', () => {
    render(<MensajeBubble mensaje={mensajeBase} esMio leidoPorOtro />);
    expect(screen.getByText('✓✓')).toBeInTheDocument();
    expect(screen.getByLabelText('Acciones del mensaje')).toBeInTheDocument();
  });

  it('si no es mío, no muestra menú', () => {
    render(<MensajeBubble mensaje={mensajeBase} esMio={false} />);
    expect(screen.queryByLabelText('Acciones del mensaje')).not.toBeInTheDocument();
  });

  it('si eliminado, muestra el placeholder', () => {
    const eliminado = { ...mensajeBase, esta_eliminado: true };
    render(<MensajeBubble mensaje={eliminado} esMio={false} />);
    expect(screen.getByText(/Este mensaje ha sido eliminado/i)).toBeInTheDocument();
  });

  it('click en ⋯ abre menú con Editar/Borrar', async () => {
    const user = userEvent.setup();
    render(<MensajeBubble mensaje={mensajeBase} esMio />);
    await user.click(screen.getByLabelText('Acciones del mensaje'));
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Borrar')).toBeInTheDocument();
  });

  it('click en Borrar llama onDeleteRequest', async () => {
    const onDeleteRequest = vi.fn();
    const user = userEvent.setup();
    render(<MensajeBubble mensaje={mensajeBase} esMio onDeleteRequest={onDeleteRequest} />);
    await user.click(screen.getByLabelText('Acciones del mensaje'));
    await user.click(screen.getByText('Borrar'));
    expect(onDeleteRequest).toHaveBeenCalledTimes(1);
  });

  it('en edición: renderiza Textarea con botones Cancelar/Guardar', () => {
    render(
      <MensajeBubble
        mensaje={mensajeBase}
        esMio
        enEdicion
        editContenido="Editado"
        onCancelEdit={() => {}}
        onSaveEdit={() => {}}
      />,
    );
    expect(screen.getByLabelText('Editar mensaje')).toHaveValue('Editado');
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('si esta_editado, muestra "editado"', () => {
    const editado = { ...mensajeBase, esta_editado: true };
    render(<MensajeBubble mensaje={editado} esMio />);
    expect(screen.getByText('editado')).toBeInTheDocument();
  });
});

it('si eliminado, NO renderiza los adjuntos', () => {
  const eliminadoConAdjuntos = {
    ...mensajeBase,
    esta_eliminado: true,
    adjuntos: [
      {
        adjunto_id: 1,
        nombre: 'foto.jpg',
        archivo_url: 'http://x/1.jpg',
        content_type: 'image/jpeg',
        tamano_bytes: 1024,
      },
    ],
  };
  render(<MensajeBubble mensaje={eliminadoConAdjuntos} esMio={false} />);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByText(/Este mensaje ha sido eliminado/i)).toBeInTheDocument();
});