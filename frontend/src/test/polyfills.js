// src/test/polyfills.js
// Polyfills para MSW en jsdom + pool 'vmThreads'.
// MSW v3+ usa ReadableStream y WritableStream internamente.
// jsdom no los expone, y el contexto VM de 'vmThreads' los aísla aún más.
// Importamos ambos desde node:stream/web (implementación nativa de Node).
import { ReadableStream, WritableStream } from 'node:stream/web';

if (typeof globalThis.ReadableStream === 'undefined') {
    globalThis.ReadableStream = ReadableStream;
}

if (typeof globalThis.WritableStream === 'undefined') {
    globalThis.WritableStream = WritableStream;
}