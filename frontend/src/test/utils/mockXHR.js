// src/test/utils/mockXHR.js
import { vi } from 'vitest';

/**
 * Mock de XMLHttpRequest para tests de subida.
 *
 * En jsdom, `XMLHttpRequest` es una propiedad read-only del global;
 * por eso se redefine con `Object.defineProperty` (mismo patrón que el
 * mock de WebSocket en `socket.js`).
 *
 * Uso:
 *   const { restore } = installMockXHR({ status: 200 });
 *   // ... test ...
 *   restore();
 */
export function installMockXHR({ status = 200 } = {}) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        'XMLHttpRequest',
    );

    class MockXHR {
        constructor() {
            this.upload = {};
            this._headers = {};
            this.readyState = 0;
            this.status = 0;
        }

        open(method, url) {
            this._method = method;
            this._url = url;
            this.readyState = 1;
        }

        setRequestHeader(key, value) {
            this._headers[key] = value;
        }

        send(body) {
            if (this.upload && typeof this.upload.onprogress === 'function') {
                this.upload.onprogress({ lengthComputable: true, loaded: 100, total: 100 });
            }
            this.readyState = 4;
            this.status = status;
            // Un XHR real llama a `onload` siempre que hay respuesta HTTP (200, 500, etc.),
            // y solo a `onerror` si hay error de red (sin respuesta). Simulamos eso.
            if (typeof this.onload === 'function') this.onload();
        }

        abort() { }
    }

    Object.defineProperty(globalThis, 'XMLHttpRequest', {
        value: MockXHR,
        configurable: true,
        writable: true,
        enumerable: originalDescriptor?.enumerable ?? true,
    });

    return {
        restore() {
            if (originalDescriptor) {
                Object.defineProperty(
                    globalThis,
                    'XMLHttpRequest',
                    originalDescriptor,
                );
            } else {
                delete globalThis.XMLHttpRequest;
            }
            vi.restoreAllMocks();
        },
    };
}