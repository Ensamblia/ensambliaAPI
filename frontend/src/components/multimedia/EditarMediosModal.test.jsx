// src/components/multimedia/EditarMediosModal.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditarMediosModal } from './EditarMediosModal';

const anuncio = {
  anuncio_id: 42,
  multimedias: [],
};

const biblioteca = [
  {
    multimedia_id: 1,
    nombre: 'a.jpg',
    archivo: 'multimedia/a.jpg',
    archivo_url: 'http://x/a.jpg',
    tipo_mime: 'image/jpeg',
    tamano_bytes: 100,
  },
];

describe('EditarMediosModal', () => {
  it('renderiza el modal con biblioteca', async () => {
    render(
      <EditarMediosModal
        anuncio={anuncio}
        perfilId={1}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Multimedia del anuncio/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'a.jpg' })).toBeInTheDocument();
    });
  });

  it('toggle selecciona un medio', async () => {
    const user = userEvent.setup();
    render(
      <EditarMediosModal
        anuncio={anuncio}
        perfilId={1}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'a.jpg' })).toBeInTheDocument();
    });
    // Click en el Card (que envuelve la imagen)
    await user.click(screen.getByRole('img', { name: 'a.jpg' }));
    // Aparece el check
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('"Guardar cambios" llama a onSaved y onClose', async () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <EditarMediosModal
        anuncio={anuncio}
        perfilId={1}
        onClose={onClose}
        onSaved={onSaved}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'a.jpg' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('img', { name: 'a.jpg' }));
    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }));
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});