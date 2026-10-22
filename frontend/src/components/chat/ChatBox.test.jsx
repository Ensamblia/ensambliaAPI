// src/components/chat/ChatBox.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationsContext } from '@/context/NotificationsContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { installMockWebSocket } from '@/test/utils/socket';
import { ChatBox } from './ChatBox';

function renderChatBox({ route = '/chat' } = {}) {
  return render(
    <AuthProvider>
      <NotificationsContext.Provider value={{
        unread: {},
        totalUnread: 0,
        clearUnread: () => {},
        activeChatId: null,
        setActiveChatId: () => {},
      }}>
        <MemoryRouter initialEntries={[route]}>
          <ChatBox />
        </MemoryRouter>
      </NotificationsContext.Provider>
    </AuthProvider>,
  );
}

describe('ChatBox', () => {
  let wsMock;

  beforeEach(() => {
    localStorage.setItem('ensamblia_token', 'tok.x');
    localStorage.setItem('ensamblia_usuario', 'ana');
  });

  afterEach(() => {
    if (wsMock) wsMock.restore();
  });

  it('sin perfil muestra aviso para crearlo', async () => {
    server.use(
      http.get(`${API}/perfiles/me/`, () =>
        HttpResponse.json({ error: 'No perfil' }, { status: 404 }),
      ),
    );
    renderChatBox();
    await waitFor(() => {
      expect(screen.getByText(/Necesitas crear tu perfil/i)).toBeInTheDocument();
    });
  });

  it('con perfil carga la lista de conversaciones', async () => {
    wsMock = installMockWebSocket('ws://localhost:8000');
    server.use(
      http.get(`${API}/perfiles/me/`, () =>
        HttpResponse.json({
          perfil_id: 1,
          nombre: 'Ana',
          apellido: 'García',
          correo: 'ana@test.com',
          descripcion: 'Cantante',
          comarca_id: null,
          usuario_id: 1,
        }),
      ),
      http.get(`${API}/perfil-chats/perfil/`, () =>
        HttpResponse.json([{ perfil_id: 1, chat_id: 42 }]),
      ),
      http.get(`${API}/perfil-chats/chat/`, () =>
        HttpResponse.json([
          { perfil_id: 1, chat_id: 42 },
          { perfil_id: 2, chat_id: 42 },
        ]),
      ),
      http.get(`${API}/perfiles/2/`, () =>
        HttpResponse.json({
          perfil_id: 2,
          nombre: 'Luis',
          apellido: 'Flotu',
          correo: 'luis@test.com',
          descripcion: 'Guitarrista',
          comarca_id: null,
          usuario_id: 2,
        }),
      ),
      http.get(`${API}/mensajes/chat/`, () =>
        HttpResponse.json({ results: [], has_more: false }),
      ),
    );
    renderChatBox({ route: '/chat?chat=42' });
await waitFor(() => {
  // Aparece en la sidebar (ConversationItem) Y en la cabecera (ChatHeader).
  expect(screen.getAllByText('Luis Flotu').length).toBeGreaterThanOrEqual(1);
});
  });
});