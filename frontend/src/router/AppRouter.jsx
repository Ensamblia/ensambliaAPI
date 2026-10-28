// src/router/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth, PublicOnly } from './guards';
import { PublicLayout } from './PublicLayout';
import { AppLayout } from './AppLayout';
import { HomePage } from '../pages/HomePage';
import { AnunciosPage } from '../pages/AnunciosPage';
import { LocalesPage } from '../pages/LocalesPage';
import { PreciosPage } from '../pages/PreciosPage';
import { MatchPage } from '../pages/MatchPage';
import { AnuncioDetailPage } from '../pages/AnuncioDetailPage';
import { PerfilPage } from '../pages/PerfilPage';
import { PerfilPublicoPage } from '../pages/PerfilPublicoPage';
import { ChatPage } from '../pages/ChatPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { CrearAnuncioPage } from '../pages/CrearAnuncioPage';
import styles from './AppRouter.module.css';

export function AppRouter() {
  return (
    <BrowserRouter>
      <div className={styles.layout}>
        <Routes>
          {/* ── Rutas públicas (LandingNavbar) ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/anuncios" element={<AnunciosPage />} />
            <Route path="/locales" element={<LocalesPage />} />
            <Route path="/precios" element={<PreciosPage />} />
            <Route path="/anuncios/:id" element={<AnuncioDetailPage />} />
            <Route path="/perfiles/:id" element={<PerfilPublicoPage />} />
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <LoginPage />
                </PublicOnly>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnly>
                  <RegisterPage />
                </PublicOnly>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* ── Rutas privadas (Navbar de app) ── */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/anuncios/crear" element={<CrearAnuncioPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}