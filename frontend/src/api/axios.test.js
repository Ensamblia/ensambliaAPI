// src/api/axios.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import api, { extractList, parseApiError } from './axios';

describe('extractList', () => {
    it('devuelve results de una respuesta DRF paginada', () => {
        const res = { data: { count: 2, next: null, previous: null, results: [{ id: 1 }, { id: 2 }] } };
        expect(extractList(res)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('devuelve el array plano si data es array', () => {
        const res = { data: [{ id: 1 }, { id: 2 }] };
        expect(extractList(res)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('devuelve [] si data es null/undefined', () => {
        expect(extractList({ data: null })).toEqual([]);
        expect(extractList({ data: undefined })).toEqual([]);
        expect(extractList({})).toEqual([]);
        expect(extractList(null)).toEqual([]);
    });

    it('acepta el array directamente (sin envoltorio res)', () => {
        expect(extractList([{ id: 1 }])).toEqual([{ id: 1 }]);
    });
});

describe('parseApiError', () => {
    it('usa detail (DRF estándar)', () => {
        const err = { response: { status: 401, data: { detail: 'No autenticado' } } };
        expect(parseApiError(err)).toBe('No autenticado');
    });

    it('usa error (vistas custom)', () => {
        const err = { response: { status: 403, data: { error: 'No participas en este chat' } } };
        expect(parseApiError(err)).toBe('No participas en este chat');
    });

    it('usa message (auth register)', () => {
        const err = { response: { status: 409, data: { message: 'Username in use' } } };
        expect(parseApiError(err)).toBe('Username in use');
    });

    it('usa el primer campo de un error de validación', () => {
        const err = {
            response: {
                status: 400,
                data: { titulo: ['Titulo is a mandatory field. Cannot be undefined or null'] },
            },
        };
        expect(parseApiError(err)).toBe('Titulo is a mandatory field. Cannot be undefined or null');
    });

    it('usa el primer campo si es string', () => {
        const err = { response: { status: 400, data: { nombre: 'nombre es obligatorio' } } };
        expect(parseApiError(err)).toBe('nombre es obligatorio');
    });

    it('devuelve fallback si no hay response', () => {
        expect(parseApiError(new Error('Network Error'))).toBe('Network Error');
        expect(parseApiError({})).toBe('Ha ocurrido un error');
    });

    it('prioriza detail > error > message > campo', () => {
        const err = {
            response: { status: 400, data: { message: 'm', error: 'e', detail: 'd', campo: ['x'] } },
        };
        expect(parseApiError(err)).toBe('d');
    });
});

describe('interceptor de barra final', () => {
    // No hacemos peticiones reales: inspeccionamos config.
    it('añade barra final a URLs sin query y sin barra', async () => {
        // Interceptamos el adapter para no tocar red.
        const originalAdapter = api.defaults.adapter;
        let seenConfig;
        api.defaults.adapter = async (config) => {
            seenConfig = config;
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
        };

        await api.get('/perfiles/me');

        expect(seenConfig.url).toBe('/perfiles/me/');
        api.defaults.adapter = originalAdapter;
    });

    it('NO añade barra si hay query params', async () => {
        const originalAdapter = api.defaults.adapter;
        let seenConfig;
        api.defaults.adapter = async (config) => {
            seenConfig = config;
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
        };

        await api.get('/anuncios?limit=2');

        expect(seenConfig.url).toBe('/anuncios?limit=2');
        api.defaults.adapter = originalAdapter;
    });

    it('NO duplica barra si ya la tiene', async () => {
        const originalAdapter = api.defaults.adapter;
        let seenConfig;
        api.defaults.adapter = async (config) => {
            seenConfig = config;
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
        };

        await api.get('/perfiles/me/');

        expect(seenConfig.url).toBe('/perfiles/me/');
        api.defaults.adapter = originalAdapter;
    });
});

describe('response interceptor 401', () => {
    it('emite auth:unauthorized y limpia localStorage en 401 autenticado', async () => {
        // Ponemos token y usuario en localStorage
        localStorage.setItem('ensamblia_token', 'tok.caducado');
        localStorage.setItem('ensamblia_usuario', 'ana');

        // Espía del evento
        const listener = vi.fn();
        window.addEventListener('auth:unauthorized', listener);

        // Adapter que simula un 401 autenticado
        const originalAdapter = api.defaults.adapter;
        api.defaults.adapter = async (config) => {
            const err = new Error('Unauthorized');
            err.config = config;
            err.response = { status: 401, data: { detail: 'Token expired' }, config };
            throw err;
        };

        await expect(api.get('/perfiles/me')).rejects.toBeTruthy();

        expect(listener).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem('ensamblia_token')).toBeNull();
        expect(localStorage.getItem('ensamblia_usuario')).toBeNull();

        window.removeEventListener('auth:unauthorized', listener);
        api.defaults.adapter = originalAdapter;
    });

    it('NO emite auth:unauthorized en 401 de /auth/login', async () => {
        localStorage.setItem('ensamblia_token', 'tok.x');
        localStorage.setItem('ensamblia_usuario', 'ana');

        const listener = vi.fn();
        window.addEventListener('auth:unauthorized', listener);

        const originalAdapter = api.defaults.adapter;
        api.defaults.adapter = async (config) => {
            const err = new Error('Bad credentials');
            err.config = config;
            err.response = { status: 401, data: { detail: 'No active account' }, config };
            throw err;
        };

        await expect(api.post('/auth/login', { usuario: 'ana', password: 'mala' })).rejects.toBeTruthy();

        expect(listener).not.toHaveBeenCalled();
        // No se limpia la sesión
        expect(localStorage.getItem('ensamblia_token')).toBe('tok.x');

        window.removeEventListener('auth:unauthorized', listener);
        api.defaults.adapter = originalAdapter;
    });

    it('NO emite auth:unauthorized si la petición no llevaba Authorization', async () => {
        localStorage.removeItem('ensamblia_token');
        localStorage.removeItem('ensamblia_usuario');

        const listener = vi.fn();
        window.addEventListener('auth:unauthorized', listener);

        const originalAdapter = api.defaults.adapter;
        api.defaults.adapter = async (config) => {
            const err = new Error('Unauthorized');
            err.config = config;
            err.response = { status: 401, data: { detail: 'Nope' }, config };
            throw err;
        };

        await expect(api.get('/anuncios')).rejects.toBeTruthy();

        expect(listener).not.toHaveBeenCalled();

        window.removeEventListener('auth:unauthorized', listener);
        api.defaults.adapter = originalAdapter;
    });
});

describe('parseApiError — casos reales del back Ensamblia', () => {
    it('400 validación de anuncio (AnuncioCreateSerializer)', () => {
        const err = {
            response: {
                status: 400,
                data: { titulo: ['Titulo is a mandatory field. Cannot be undefined or null'] },
            },
        };
        expect(parseApiError(err)).toMatch(/Titulo is a mandatory/);
    });

    it('403 sin perfil en anuncio', () => {
        const err = {
            response: { status: 403, data: { error: 'Necesitas crear tu perfil antes de publicar un anuncio' } },
        };
        expect(parseApiError(err)).toMatch(/Necesitas crear tu perfil/);
    });

    it('403 sin perfil en chat', () => {
        const err = {
            response: { status: 403, data: { error: 'No participas en este chat' } },
        };
        expect(parseApiError(err)).toMatch(/No participas en este chat/);
    });

    it('400 "Ya tienes un perfil personal"', () => {
        const err = {
            response: {
                status: 400,
                data: { error: 'Ya tienes un perfil personal. No puedes crear otro.' },
            },
        };
        expect(parseApiError(err)).toMatch(/Ya tienes un perfil personal/);
    });

    it('401 DRF estándar (detail)', () => {
        const err = {
            response: { status: 401, data: { detail: 'Given token not valid for any token type' } },
        };
        expect(parseApiError(err)).toMatch(/Given token not valid/);
    });

    it('409 registro (message)', () => {
        const err = { response: { status: 409, data: { message: 'Username in use' } } };
        expect(parseApiError(err)).toBe('Username in use');
    });

    it('400 comentario (contenido obligatorio)', () => {
        const err = {
            response: { status: 400, data: { contenido: ['contenido is a mandatory field. Cannot be undefined or null'] } },
        };
        expect(parseApiError(err)).toMatch(/contenido is a mandatory/);
    });
});