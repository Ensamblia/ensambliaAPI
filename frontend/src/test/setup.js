// src/test/setup.js
import './polyfills';                              // ← PRIMERO: WritableStream para MSW
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './msw/server';

// ── MSW: ciclo de vida global ──
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── localStorage limpio entre tests ──
afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

// ── matchMedia (jsdom no lo implementa) ──
if (!window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    });
}

// ── IntersectionObserver (por si algún componente lo usa) ──
if (!window.IntersectionObserver) {
    class IO {
        observe() { }
        unobserve() { }
        disconnect() { }
    }
    window.IntersectionObserver = IO;
    global.IntersectionObserver = IO;
}

// ── scrollIntoView (jsdom no lo implementa; ChatBox lo usa) ──
if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
}

// ── Silenciar ruido conocido de React, NO errores reales ──
const originalError = console.error;
console.error = (...args) => {
    const first = args[0];
    if (
        typeof first === 'string' &&
        (first.includes('not wrapped in act') ||
            first.includes('Warning: An update to'))
    ) {
        return;
    }
    originalError(...args);
};