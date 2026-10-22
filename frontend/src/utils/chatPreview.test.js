// src/utils/chatPreview.test.js
import { describe, it, expect } from 'vitest';
import { buildPreview } from './chatPreview';

describe('buildPreview', () => {
    it('devuelve "" si no hay mensaje', () => {
        expect(buildPreview(null)).toBe('');
        expect(buildPreview(undefined)).toBe('');
    });

    it('devuelve el contenido si existe', () => {
        expect(buildPreview({ contenido: 'Hola' })).toBe('Hola');
    });

    it('devuelve el contenido aunque haya adjuntos', () => {
        expect(
            buildPreview({ contenido: 'Mira esto', adjuntos: [{ adjunto_id: 1 }] }),
        ).toBe('Mira esto');
    });

    it('devuelve "📎 Adjunto" si solo hay adjuntos', () => {
        expect(
            buildPreview({ contenido: '', adjuntos: [{ adjunto_id: 1 }] }),
        ).toBe('📎 Adjunto');
    });

    it('devuelve "📎 Adjunto" si contenido es solo espacios', () => {
        expect(
            buildPreview({ contenido: '   ', adjuntos: [{ adjunto_id: 1 }] }),
        ).toBe('📎 Adjunto');
    });

    it('devuelve "🚫 Mensaje eliminado" si está eliminado', () => {
        expect(
            buildPreview({
                contenido: 'Hola',
                esta_eliminado: true,
                adjuntos: [{ adjunto_id: 1 }],
            }),
        ).toBe('🚫 Mensaje eliminado');
    });

    it('devuelve "" si no hay contenido ni adjuntos', () => {
        expect(buildPreview({ contenido: '' })).toBe('');
        expect(buildPreview({ contenido: '', adjuntos: [] })).toBe('');
    });
});


describe('buildPreview — integración con lista de mensajes', () => {
    it('recalcula el preview al marcar el último como eliminado', () => {
        const mensajes = [
            { mensaje_id: 1, contenido: 'Hola' },
            { mensaje_id: 2, contenido: 'Mira esto' },
        ];
        // Preview inicial
        expect(buildPreview(mensajes[mensajes.length - 1])).toBe('Mira esto');

        // Simulamos el handler mensaje_borrado del último
        const nuevos = mensajes.map((m) =>
            m.mensaje_id === 2 ? { ...m, esta_eliminado: true } : m
        );
        expect(buildPreview(nuevos[nuevos.length - 1])).toBe('🚫 Mensaje eliminado');
    });

    it('recalcula el preview al editar el último', () => {
        const mensajes = [{ mensaje_id: 1, contenido: 'Hola' }];
        expect(buildPreview(mensajes[0])).toBe('Hola');

        const nuevos = mensajes.map((m) =>
            m.mensaje_id === 1 ? { ...m, contenido: 'Hola editado' } : m
        );
        expect(buildPreview(nuevos[0])).toBe('Hola editado');
    });

    it('no cambia el preview si se borra un mensaje que no es el último', () => {
        const mensajes = [
            { mensaje_id: 1, contenido: 'Primero' },
            { mensaje_id: 2, contenido: 'Segundo' },
        ];
        const nuevos = mensajes.map((m) =>
            m.mensaje_id === 1 ? { ...m, esta_eliminado: true } : m
        );
        // El último sigue siendo el 2, con contenido
        expect(buildPreview(nuevos[nuevos.length - 1])).toBe('Segundo');
    });
});