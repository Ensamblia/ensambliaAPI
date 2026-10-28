import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { API } from '@/test/msw/handlers';
import { HomePage } from './HomePage';

// Mock de lucide-react (iconos): jsdom no los necesita para el test.
vi.mock('lucide-react', () => {
    const Icon = () => null;
    return {
        ArrowDownRight: Icon,
        ArrowUpRight: Icon,
        CalendarDays: Icon,
        Check: Icon,
        ChevronRight: Icon,
        Guitar: Icon,
        Heart: Icon,
        MapPin: Icon,
        MessageCircle: Icon,
        Music2: Icon,
        Play: Icon,
        Search: Icon,
        Sparkles: Icon,
        Store: Icon,
        Users: Icon,
    };
    });

function renderHome() {
    return render(
        <AuthProvider>
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
        </AuthProvider>,
    );
}

describe('HomePage — stats del landing', () => {
    it('muestra los stats del backend cuando llegan', async () => {
    const { container } = renderHome();
    await waitFor(() => {
        const statsSection = container.querySelector('.stats-section');
        expect(statsSection).toBeInTheDocument();
        const textos = Array.from(statsSection.querySelectorAll('strong')).map(
        (el) => el.textContent,
        );
        // Comprobamos los números (sin depender del formato de toLocaleString,
        // que en jsdom puede no agrupar los miles).
        expect(textos.some((t) => t.includes('12345') || t.includes('12.345'))).toBe(true);
        expect(textos.some((t) => t.includes('3210') || t.includes('3.210'))).toBe(true);
        expect(textos.some((t) => t.includes('987'))).toBe(true);
        expect(textos.some((t) => t.includes('15678') || t.includes('15.678'))).toBe(true);
    });
    });

    it('muestra el label "ANUNCIOS AL MES" (no "EVENTOS AL MES")', async () => {
        renderHome();
        await waitFor(() => {
        expect(screen.getByText('ANUNCIOS AL MES')).toBeInTheDocument();
        });
        expect(screen.queryByText('EVENTOS AL MES')).not.toBeInTheDocument();
    });

    it('fallback a testimonios hardcoded si el back devuelve []', async () => {
        renderHome();
        await waitFor(() => {
        expect(screen.getByText(/Carlos R\./)).toBeInTheDocument();
        expect(screen.getByText(/Laura M\./)).toBeInTheDocument();
        expect(screen.getByText(/Javier P\./)).toBeInTheDocument();
        });
    });

    it('muestra testimonios reales si el back los devuelve', async () => {
        server.use(
        http.get(`${API}/stats/`, () =>
            HttpResponse.json({
            usuarios_activos: 1,
            grupos_formados: 0,
            anuncios_mes: 0,
            matches: 0,
            testimonios: [
                {
                nombre: 'Ana G.',
                rol: 'Guitarra · Madrid',
                quote: 'Una comunidad increíble para encontrar gente con la que tocar.',
                },
            ],
            }),
        ),
        );
        renderHome();
        await waitFor(() => {
        expect(screen.getByText('Ana G.')).toBeInTheDocument();
        });
        expect(screen.getByText(/Una comunidad increíble/)).toBeInTheDocument();
        expect(screen.getByText('Guitarra · Madrid')).toBeInTheDocument();
        expect(screen.queryByText(/Carlos R\./)).not.toBeInTheDocument();
    });
    });

    it('muestra usuarios_online del backend en el hero-card', async () => {
    const { container } = renderHome();
    await waitFor(() => {
        // El hero-card inferior muestra "5.678 músicos conectados"
        const bottomCard = container.querySelector('.hero-card--bottom');
        expect(bottomCard).toBeInTheDocument();
        expect(bottomCard.textContent).toMatch(/5\.678|5678/);
    });
    });