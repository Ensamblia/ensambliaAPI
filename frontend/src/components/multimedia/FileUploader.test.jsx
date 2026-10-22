// src/components/multimedia/FileUploader.test.jsx
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { installMockXHR } from '@/test/utils/mockXHR';
import { FileUploader } from './FileUploader';

describe('FileUploader', () => {
  let xhrMock;

  afterEach(() => {
    if (xhrMock) xhrMock.restore();
  });

  it('renderiza dropzone con label y hint', () => {
    render(<FileUploader />);
    expect(screen.getByRole('button', { name: /arrastra un archivo/i })).toBeInTheDocument();
    expect(screen.getByText(/Imágenes ≤10MB/)).toBeInTheDocument();
  });

  it('sube un archivo al seleccionarlo', async () => {
    xhrMock = installMockXHR({ status: 200 });

    const user = userEvent.setup();
    const onUploaded = vi.fn();
    render(<FileUploader onUploaded={onUploaded} />);

    const input = document.querySelector('input[type="file"]');
    const file = new File(['hola'], 'test.jpg', { type: 'image/jpeg' });
    await user.upload(input, file);

    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'test.jpg' }),
      );
    });
  });

  it('muestra error si el back rechaza el presigned', async () => {
    xhrMock = installMockXHR({ status: 200 });

    server.use(
      http.post(`${API}/multimedias/presigned-url/`, () =>
        HttpResponse.json({ error: 'Tipo no permitido' }, { status: 400 }),
      ),
    );

    const user = userEvent.setup();
    render(<FileUploader />);

    const input = document.querySelector('input[type="file"]');
const file = new File(['hola'], 'test.jpg', { type: 'image/jpeg' });
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Tipo no permitido/)).toBeInTheDocument();
    });
  });

  it('muestra error si el PUT a MinIO falla', async () => {
    xhrMock = installMockXHR({ status: 500 });

    const user = userEvent.setup();
    render(<FileUploader />);

    const input = document.querySelector('input[type="file"]');
    const file = new File(['hola'], 'test.jpg', { type: 'image/jpeg' });
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Error al subir a MinIO/i)).toBeInTheDocument();
    });
  });
});