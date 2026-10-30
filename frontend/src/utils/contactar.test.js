import { describe, it, expect, vi } from 'vitest';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { contactarPerfil } from './contactar';

function responde(status, body = {}) {
  server.use(http.post(`${API}/chats/con/:perfilId/`, () => HttpResponse.json(body, { status })));
}

describe('contactarPerfil', () => {
  it('si va bien navega al chat y no devuelve error', async () => {
    responde(201, { chat_id: 7 });
    const navigate = vi.fn();
    expect(await contactarPerfil(3, navigate)).toBe('');
    expect(navigate).toHaveBeenCalledWith('/chat?chat=7');
  });

  it('sin sesión lleva al login recordando la página actual', async () => {
    responde(401);
    const navigate = vi.fn();
    expect(await contactarPerfil(3, navigate)).toBe('');
    expect(navigate).toHaveBeenCalledWith('/login', { state: { from: expect.any(String) } });
  });

  it('sin perfil pide crearlo', async () => {
    responde(403);
    expect(await contactarPerfil(3, vi.fn())).toMatch(/crear tu perfil/i);
  });

  it('usa el mensaje del backend en un 400', async () => {
    responde(400, { error: 'No puedes abrir un chat contigo' });
    expect(await contactarPerfil(3, vi.fn())).toBe('No puedes abrir un chat contigo');
  });

  it('otro error da un mensaje genérico en español', async () => {
    responde(500);
    expect(await contactarPerfil(3, vi.fn())).toBe('No se pudo iniciar la conversación.');
  });
});
