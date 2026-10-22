// src/hooks/useFocusTrap.js
import { useEffect } from 'react';

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Atrapa el foco dentro de `containerRef.current` mientras `active` es true.
 * Al desactivarse, restaura el foco al elemento que lo tenía antes.
 *
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {boolean} active
 */
export function useFocusTrap(containerRef, active) {
    useEffect(() => {
        if (!active) return;

        const container = containerRef.current;
        if (!container) return;

        const previouslyFocused = document.activeElement;

        // Foco inicial: primer focusable o el contenedor.
        const focusables = container.querySelectorAll(FOCUSABLE_SELECTOR);
        if (focusables.length > 0) {
            focusables[0].focus();
        } else {
            container.setAttribute('tabindex', '-1');
            container.focus();
        }

        const onKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        container.addEventListener('keydown', onKeyDown);

        return () => {
            container.removeEventListener('keydown', onKeyDown);
            if (previouslyFocused && previouslyFocused.focus) {
                previouslyFocused.focus();
            }
        };
    }, [containerRef, active]);
}