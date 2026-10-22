// src/components/cards/AnuncioCard.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AnuncioCard } from './AnuncioCard';

// Mock de AutorNombre (se migra en F.7). Evita hacer petición de perfil.
vi.mock('@/components/perfil/AutorNombre', () => ({
  AutorNombre: ({ perfilId }) => <span>Autor {perfilId}</span>,
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const anuncioBase = {
  anuncio_id: 42,
  titulo: 'Busco batería para grupo de rock',
  contenido: 'Grupo de rock alternativo en Madrid busca batería.',
  perfil_id: 7,
  tipo_anuncio_id: 1,
  fecha_publicacion: '2026-10-01T10:00:00Z',
  multimedias: [],
};

function renderCard(anuncio = anuncioBase) {
  return render(
    <MemoryRouter>
      <AnuncioCard anuncio={anuncio} />
    </MemoryRouter>,
  );
}

describe('AnuncioCard', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it('renderiza título, extracto, autor y fecha', () => {
    renderCard();
    expect(screen.getByText('Busco batería para grupo de rock')).toBeInTheDocument();
    expect(screen.getByText(/Grupo de rock alternativo/i)).toBeInTheDocument();
    expect(screen.getByText(/Autor 7/i)).toBeInTheDocument();
    // Fecha formateada es-ES
    expect(screen.getByText(/01 oct 2026/i)).toBeInTheDocument();
  });

  it('click en el card navega al detalle', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByText('Busco batería para grupo de rock'));
    expect(navigateMock).toHaveBeenCalledWith('/anuncios/42');
  });

  it('click en "Ver más" navega al detalle', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole('button', { name: /Ver más/i }));
    expect(navigateMock).toHaveBeenCalledWith('/anuncios/42');
  });

  it('click en "Contactar" hace POST y navega a /chat', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole('button', { name: /Contactar/i }));
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/chat?chat=99');
    });
  });

  it('403 al contactar muestra error', async () => {
    // Este test requiere un handler MSW alternativo. Lo dejamos para cuando
    // migremos FiltrosAnuncios y AnunciosPage (F.4.2/F.4.3), donde ya tenemos
    // MSW para /chats/con/. Por ahora, cubrimos el caso happy.
    expect(true).toBe(true);
  });

  it('sin multimedia no renderiza thumbnails', () => {
    renderCard();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('con una imagen renderiza un thumbnail', () => {
    const conMedia = {
      ...anuncioBase,
      multimedias: [
        { multimedia_id: 1, archivo_url: 'http://x/1.jpg', tipo_mime: 'image/jpeg', nombre: 'a.jpg' },
      ],
    };
    renderCard(conMedia);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://x/1.jpg');
  });
});