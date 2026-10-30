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

    it('sin testimonios reales no enseña la sección de comunidad (nada inventado)', async () => {
        const { container } = renderHome();
        await waitFor(() => {
        expect(container.querySelector('.stats-section')).toBeInTheDocument();
        });
        expect(container.querySelector('.community-section')).not.toBeInTheDocument();
        expect(screen.queryByText(/Carlos R\./)).not.toBeInTheDocument();
    });

    it('con cifras pequeñas no enseña cifras ni "músicos conectados"', async () => {
        server.use(
        http.get(`${API}/stats/`, () =>
            HttpResponse.json({
            usuarios_activos: 3, usuarios_online: 0, grupos_formados: 0,
            anuncios_mes: 0, matches: 1, testimonios: [],
            }),
        ),
        );
        const { container } = renderHome();
        await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        });
        // Damos tiempo a que llegue la respuesta del back
        await new Promise((r) => setTimeout(r, 50));
        expect(container.querySelector('.stats-section')).not.toBeInTheDocument();
        expect(container.querySelector('.hero-proof')).not.toBeInTheDocument();
        expect(container.querySelector('.hero-card--bottom')).not.toBeInTheDocument();
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

describe('HomePage — sin callejones sin salida', () => {
    it('las tarjetas de funciones son enlaces a secciones reales y no hay marketplace', () => {
        renderHome();
        const destinos = ['Encuentra tu gente', 'Encuentra dónde ensayar y tocar', 'Planifica tus próximos directos', 'Habla y crea', 'Dale espacio a tu banda']
            .map((t) => screen.getByText(t).closest('a')?.getAttribute('href'));
        expect(destinos).toEqual(['/match', '/locales', '/eventos', '/chat', '/anuncios']);
        expect(screen.queryByText(/marketplace/i)).not.toBeInTheDocument();
    });

    it('no promete apps en tiendas ni redes sociales que no existen', () => {
        renderHome();
        expect(screen.queryByText(/Próximamente/)).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Instagram')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Contacto' })).not.toBeInTheDocument();
    });

    it('con sesión iniciada no invita a crear cuenta', () => {
        localStorage.setItem('ensamblia_token', 'tok');
        localStorage.setItem('ensamblia_usuario', 'ana');
        try {
            renderHome();
            expect(screen.getByRole('link', { name: /Ir a mi perfil/ })).toHaveAttribute('href', '/perfil');
            expect(screen.queryByRole('link', { name: /Crear cuenta/ })).not.toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /Únete gratis/ })).not.toBeInTheDocument();
        } finally {
            localStorage.clear();
        }
    });
});

