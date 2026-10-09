import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingNavbar } from '../components/navbar/LandingNavbar';
import { AuthContext } from '../context/AuthContext';
import { HomePage }     from '../pages/HomePage';
import { AnunciosPage } from '../pages/AnunciosPage';
import { AnuncioDetailPage } from '../pages/AnuncioDetailPage';
import { PerfilPage }   from '../pages/PerfilPage';
import { PerfilPublicoPage } from '../pages/PerfilPublicoPage';
import { ChatPage }     from '../pages/ChatPage';
import { LoginPage }    from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { CrearAnuncioPage } from '../pages/CrearAnuncioPage';

const layoutStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#fffdf8',
  fontFamily: "'Inter', sans-serif",
};

function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <div style={layoutStyle}>
        <LandingNavbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anuncios" element={<AnunciosPage />} />
          <Route path="/anuncios/crear" element={<RequireAuth><CrearAnuncioPage /></RequireAuth>} />
          <Route path="/anuncios/:id" element={<AnuncioDetailPage />} />
          <Route path="/perfil" element={<RequireAuth><PerfilPage /></RequireAuth>} />
          <Route path="/perfiles/:id" element={<PerfilPublicoPage />} />
          <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
