// src/hooks/useBodyLock.js
import { useEffect } from 'react';

/**
 * Bloquea el scroll del body mientras `locked` es true.
 * Restaura el overflow original al desmontar.
 */
export function useBodyLock(locked) {
    useEffect(() => {
        if (!locked) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = original;
        };
    }, [locked]);
}