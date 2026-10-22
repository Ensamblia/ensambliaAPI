// src/components/multimedia/MediaGallery.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { MediaGallery } from './MediaGallery';

describe('MediaGallery', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('sin medios muestra EmptyState', async () => {
    server.use(
      http.get(`${API}/multimedias/perfil/`, () => HttpResponse.json([])),
    );
    render(<MediaGallery perfilId={1} />);
    await waitFor(() => {
      expect(screen.getByText(/Tu biblioteca está vacía/i)).toBeInTheDocument();
    });
  });

  it('renderiza items de multimedia', async () => {
    render(<MediaGallery perfilId={1} />);
    await waitFor(() => {
      const img = screen.getByRole('img', { name: 'a.jpg' });
      expect(img).toHaveAttribute('src', 'http://x/a.jpg');
    });
  });

  it('click en borrar llama al handler', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    render(<MediaGallery perfilId={1} onDeleted={onDeleted} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Borrar archivo')).toBeInTheDocument();
    });
    await user.click(screen.getByLabelText('Borrar archivo'));
    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledWith(1);
    });
  });
});