import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar';
import { HomePage }     from '../pages/HomePage';
import { AnunciosPage } from '../pages/AnunciosPage';
import { PerfilPage }   from '../pages/PerfilPage';
import { ChatPage }     from '../pages/ChatPage';
import { LoginPage }    from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

const layoutStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#FFFFFF',
  fontFamily: "'Open Sans', sans-serif",
};

export function AppRouter() {
  return (
    <BrowserRouter>
      <div style={layoutStyle}>
        <Navbar />
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/anuncios"  element={<AnunciosPage />} />
          <Route path="/perfil"    element={<PerfilPage />} />
          <Route path="/chat"      element={<ChatPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
