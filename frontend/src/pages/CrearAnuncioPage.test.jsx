// src/pages/CrearAnuncioPage.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CrearAnuncioPage } from './CrearAnuncioPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/components/multimedia/EditarMediosModal', () => ({
  EditarMediosModal: ({ onSaved }) => (
    <div data-testid="modal">
      <button onClick={() => onSaved()}>Cerrar modal</button>
    </div>
  ),
}));

function renderCrear() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <CrearAnuncioPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('CrearAnuncioPage', () => {
  it('renderiza el formulario con título, tipo y contenido', async () => {
    renderCrear();
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de anuncio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contenido/i)).toBeInTheDocument();
  });

  it('crear anuncio abre el modal', async () => {
    const user = userEvent.setup();
    renderCrear();
    await user.type(
      screen.getByLabelText(/Título/i),
      'Busco batería para grupo',
    );
    await user.type(
      screen.getByLabelText(/Contenido/i),
      'Grupo de rock alternativo busca batería.',
    );
    await user.click(screen.getByRole('button', { name: /Publicar/i }));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  it('cerrar modal navega al detalle', async () => {
    const user = userEvent.setup();
    renderCrear();
    await user.type(
      screen.getByLabelText(/Título/i),
      'Busco batería para grupo',
    );
    await user.type(
      screen.getByLabelText(/Contenido/i),
      'Grupo de rock alternativo busca batería.',
    );
    await user.click(screen.getByRole('button', { name: /Publicar/i }));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Cerrar modal'));
    expect(navigateMock).toHaveBeenCalledWith('/anuncios/100');
  });
});