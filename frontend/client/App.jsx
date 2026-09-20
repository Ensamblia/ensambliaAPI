import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TablonAnuncios } from "./pages/anuncios/TablonAnuncios";
import { AuthPage } from "./pages/AuthPage"; // Importamos la página de autenticación

const queryClient = new QueryClient();

// Componente helper para ocultar la Navbar en /auth
function LayoutWithNavbar({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/auth";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LayoutWithNavbar>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/anuncios" element={<TablonAnuncios />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LayoutWithNavbar>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}