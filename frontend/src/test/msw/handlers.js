// src/test/msw/handlers.js
import { http, HttpResponse } from 'msw';

// Base URL que usará el axios del front en tests
// (forzada por vite.config.js → test.env.VITE_API_URL).
export const API = 'http://localhost:8000/api';

// Helper para respuestas JSON limpias.
const json = (data, status = 200) => HttpResponse.json(data, { status });

export const handlers = [
    // ── AUTH ──
    http.post(`${API}/auth/login/`, async ({ request }) => {
        const body = await request.json();
        if (body.usuario === 'ana' && body.password === 'ana123') {
            return json({ token: 'fake.jwt.token.ana' });
        }
        return json(
            { detail: 'No active account found with the given credentials' },
            401,
        );
    }),

    http.post(`${API}/auth/register/`, async ({ request }) => {
        console.log('[MSW] POST /auth/login/ interceptado');
        const body = await request.json();
        console.log('[MSW] body:', body);
        if (body.usuario === 'ana') {
            return json({ message: 'Username in use' }, 409);
        }
        return json(
            {
                message: 'New user registered',
                usuario: {
                    usuario_id: 99,
                    usuario: body.usuario,
                    creado_en: new Date().toISOString(),
                    is_staff: false,
                },
                token: 'fake.jwt.token.nuevo',
            },
            201,
        );
    }),

    // ── PERFILES ──
    http.get(`${API}/perfiles/me/`, ({ request }) => {
        const auth = request.headers.get('authorization') || '';
        if (!auth.startsWith('Bearer ')) {
            return json(
                { detail: 'Authentication credentials were not provided.' },
                401,
            );
        }
        return json({
            perfil_id: 1,
            nombre: 'Ana',
            apellido: 'García',
            correo: 'ana@test.com',
            descripcion: 'Cantante',
            comarca_id: null,
            usuario_id: 1,
        });
    }),

    http.get(`${API}/perfiles/:id/`, ({ params }) => {
        const id = Number(params.id);
        if (id === 99999) {
            return json({ error: 'Nothing found for id: 99999' }, 404);
        }
        return json({
            perfil_id: id,
            nombre: 'Luis',
            apellido: 'Flotu',
            correo: 'luis@test.com',
            descripcion: 'Guitarrista',
            comarca_id: null,
            usuario_id: 2,
        });
    }),

    // ── CHATS ──
    http.post(`${API}/chats/con/:perfilId/`, ({ params }) => {
        const perfilId = Number(params.perfilId);
        // Devolvemos un chat_id predecible para los tests
        return json({ chat_id: 99 }, 201);
    }),

    // ── CATÁLOGO ──
    http.get(`${API}/tipo-anuncios/`, () =>
        json([
            { tipo_anuncio_id: 1, tipo: 'Busco músico' },
            { tipo_anuncio_id: 2, tipo: 'Vendo instrumento' },
        ]),
    ),

    // ── ANUNCIOS ──
    http.get(`${API}/anuncios/`, ({ request }) => {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get('limit') || 12);
        const offset = Number(url.searchParams.get('offset') || 0);
        const total = 3;
        const todos = [
            {
                anuncio_id: 1,
                titulo: 'Busco batería para grupo de rock',
                contenido: 'Grupo de rock alternativo en Madrid busca batería.',
                perfil_id: 1,
                tipo_anuncio_id: 1,
                fecha_publicacion: '2026-10-01T10:00:00Z',
                multimedias: [],
            },
            {
                anuncio_id: 2,
                titulo: 'Vendo guitarra eléctrica',
                contenido: 'Fender Stratocaster en perfecto estado.',
                perfil_id: 2,
                tipo_anuncio_id: 2,
                fecha_publicacion: '2026-09-15T10:00:00Z',
                multimedias: [],
            },
            {
                anuncio_id: 3,
                titulo: 'Clases de piano',
                contenido: 'Clases para todos los niveles en Barcelona.',
                perfil_id: 3,
                tipo_anuncio_id: 1,
                fecha_publicacion: '2026-09-10T10:00:00Z',
                multimedias: [],
            },
        ];
        return json({
            count: total,
            next: null,
            previous: null,
            results: todos.slice(offset, offset + limit),
        });
    }),

    // ── COMENTARIOS ──
    http.get(`${API}/comentarios/anuncio/`, () =>
        json([]),
    ),
    http.post(`${API}/comentarios/`, async ({ request }) => {
        const body = await request.json();
        return json(
            {
                comentario_id: 100,
                contenido: body.contenido,
                fecha_publicacion: new Date().toISOString(),
                esta_eliminado: false,
                anuncio_id: body.anuncio_id,
                perfil_id: 1,
            },
            201,
        );
    }),

    // ── CATÁLOGOS ──
    http.get(`${API}/comarcas/`, () =>
        json([{ comarca_id: 1, nombre: 'Madrid' }, { comarca_id: 2, nombre: 'Barcelona' }]),
    ),
    http.get(`${API}/instrumentos/`, () =>
        json([{ instrumento_id: 1, nombre: 'Guitarra' }, { instrumento_id: 2, nombre: 'Piano' }]),
    ),
    http.get(`${API}/genero_musical/`, () =>
        json([{ genero_musical_id: 1, nombre: 'Rock' }, { genero_musical_id: 2, nombre: 'Jazz' }]),
    ),

    // ── PIVOTES ──
    http.get(`${API}/perfil-instrumentos/perfil/`, () =>
        json([{ perfil_id: 1, instrumento_id: 1 }]),
    ),
    http.get(`${API}/perfil-genero-musicales/perfil/`, () =>
        json([{ perfil_id: 1, genero_id: 1 }]),
    ),
    // ── MULTIMEDIA ──
    http.post(`${API}/multimedias/presigned-url/`, () =>
        json({
            upload_url: 'http://localhost:9000/ensamblia-media/multimedia/2026/10/test.jpg?X-Amz-Signature=abc',
            object_key: 'multimedia/2026/10/test.jpg',
            archivo_url: 'http://localhost:9000/ensamblia-media/multimedia/2026/10/test.jpg',
        }),
    ),
    http.post(`${API}/multimedias/`, async ({ request }) => {
        const body = await request.json();
        return json(
            {
                multimedia_id: 1,
                nombre: body.nombre,
                archivo: body.archivo,
                archivo_url: `http://localhost:9000/ensamblia-media/${body.archivo}`,
                tamano_bytes: body.tamano_bytes,
                tipo_mime: 'image/jpeg',
                perfil_id: 1,
            },
            201,
        );
    }),
    http.get(`${API}/multimedias/perfil/`, () =>
        json([
            {
                multimedia_id: 1,
                nombre: 'a.jpg',
                archivo: 'multimedia/a.jpg',
                archivo_url: 'http://x/a.jpg',
                tipo_mime: 'image/jpeg',
                tamano_bytes: 100,
            },
        ]),
    ),
    http.delete(`${API}/multimedias/:id/`, () => json({})),
    http.post(`${API}/anuncios/:id/multimedia/`, () =>
        json({ agregados: 1, multimedia_count: 1 }, 201),
    ),
    http.delete(`${API}/anuncios/:id/multimedia/:mid/`, () => json({})),
    http.post(`${API}/anuncios/`, async ({ request }) => {
        const body = await request.json();
        return json(
            {
                anuncio_id: 100,
                titulo: body.titulo,
                contenido: body.contenido,
                perfil_id: 1,
                tipo_anuncio_id: body.tipo_anuncio_id,
                fecha_publicacion: new Date().toISOString(),
                multimedias: [],
            },
            201,
        );
    }),
    http.get(`${API}/stats/`, () =>
        json({
            usuarios_activos: 12345,
            usuarios_online: 5678,
            grupos_formados: 3210,
            anuncios_mes: 987,
            matches: 15678,
            testimonios: [],
        }),
    ),
    http.post(`${API}/presence/offline/`, () => json({ ok: true })),
    http.post(`${API}/perfiles/presigned-avatar/`, () =>
        json({
            upload_url: 'http://localhost:9000/ensamblia-media/multimedia/avatars/test.jpg?X-Amz-Signature=abc',
            object_key: 'multimedia/avatars/test.jpg',
            archivo_url: 'http://localhost:9000/ensamblia-media/multimedia/avatars/test.jpg',
        }),
    ),
    http.post(`${API}/perfiles/:id/set-avatar/`, () => json({ ok: true })),
    http.delete(`${API}/perfiles/:id/avatar/`, () => json({ ok: true })),
    http.get(`${API}/perfiles/me/`, ({ request }) => {
        const auth = request.headers.get('authorization') || '';
        if (!auth.startsWith('Bearer ')) {
            return json({ detail: 'Authentication credentials were not provided.' }, 401);
        }
        return json({
            perfil_id: 1,
            nombre: 'Ana',
            apellido: 'García',
            correo: 'ana@test.com',
            descripcion: 'Cantante',
            comarca_id: null,
            usuario_id: 1,
            foto_url: null,  // ← NUEVO
        });
    }),
];