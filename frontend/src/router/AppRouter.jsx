// src/router/AppRouter.jsx
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { RequireAuth, PublicOnly } from './guards';
import { PublicLayout } from './PublicLayout';
import { AppLayout } from './AppLayout';
import { HomePage } from '../pages/HomePage';
import { InicioPage } from '../pages/InicioPage';
import { MercadoPage } from '../pages/MercadoPage';
import { MusicosPage } from '../pages/MusicosPage';
import { BandasPage } from '../pages/BandasPage';
import { AnunciosPage } from '../pages/AnunciosPage';
import { LocalesPage } from '../pages/LocalesPage';
import { PreciosPage } from '../pages/PreciosPage';
import { MatchPage } from '../pages/MatchPage';
import { EventosPage } from '../pages/EventosPage';
import { EventoDetailPage } from '../pages/EventoDetailPage';
import { CrearEventoPage } from '../pages/CrearEventoPage';
import { AnuncioDetailPage } from '../pages/AnuncioDetailPage';
import { PerfilPage } from '../pages/PerfilPage';
import { PerfilPublicoPage } from '../pages/PerfilPublicoPage';
import { ChatPage } from '../pages/ChatPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { CrearAnuncioPage } from '../pages/CrearAnuncioPage';
import styles from './AppRouter.module.css';

// Sin sesión, la landing; con sesión, el Inicio de la app.
function Portada() {
  const { user } = useContext(AuthContext);
  return user ? <InicioPage /> : <HomePage />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <div className={styles.layout}>
        <Routes>
          {/* ── Rutas públicas (LandingNavbar): solo landing, precios y acceso ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Portada />} />
            <Route path="/precios" element={<PreciosPage />} />
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

          {/* ── Rutas privadas (AppShell): todo lo demás se desbloquea con cuenta ── */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/anuncios" element={<AnunciosPage />} />
            <Route path="/anuncios/:id" element={<AnuncioDetailPage />} />
            <Route path="/locales" element={<LocalesPage />} />
            <Route path="/eventos" element={<EventosPage />} />
            <Route path="/eventos/:id" element={<EventoDetailPage />} />
            <Route path="/perfiles/:id" element={<PerfilPublicoPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/match" element={<MatchPage />} />
            <Route path="/mercado" element={<MercadoPage />} />
            <Route path="/musicos" element={<MusicosPage />} />
            <Route path="/bandas" element={<BandasPage />} />
            <Route path="/eventos/crear" element={<CrearEventoPage />} />
            <Route path="/anuncios/crear" element={<CrearAnuncioPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}