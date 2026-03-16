import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AdminRoute } from "@/components/AdminRoute";
import Navbar from "@/components/Navbar";
import InfoLine from "@/components/InfoLine";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import ViberButton from "@/components/ViberAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import MainSlider from "@/components/MainSlider";
import MobileHero from "@/components/MobileHero";
import LoginPage from "./pages/LoginPage";
import PuntosPage from "./pages/PuntosPage";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import ContactPage from "./pages/ContactPage";
import CategoriaInfantil from "./pages/CategoriaInfantil";
import CartPage from "./pages/CartPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminMasVendidos from "./pages/admin/AdminMasVendidos";
import AdminOfertas from "./pages/admin/AdminOfertas";
import AdminChangePassword from "./pages/admin/AdminChangePassword";
import AdminShipping from "./pages/admin/AdminShipping";
import AdminInfoLine from "./pages/admin/AdminInfoLine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Sonner />
              <BrowserRouter>
                {/* Elementos globales (siempre visibles) */}
                <InfoLine />
                <Navbar />
                
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={
                    <div className="pt-[80px]"> {/* Espacio para el navbar */}
                      {isMobile ? <MobileHero /> : <MainSlider />}
                      <Index />
                    </div>
                  } />
                  
                  <Route path="/login" element={
                    <div className="pt-[80px]">
                      <LoginPage />
                    </div>
                  } />
                  
                  <Route path="/puntos" element={
                    <div className="pt-[80px]">
                      <PuntosPage />
                    </div>
                  } />
                  
                  <Route path="/categoria/:slug" element={
                    <div className="pt-[80px]">
                      <CategoryPage />
                    </div>
                  } />
                  
                  <Route path="/producto/:id" element={
                    <div className="pt-[80px]">
                      <ProductDetail />
                    </div>
                  } />
                  
                  <Route path="/contacto" element={
                    <div className="pt-[80px]">
                      <ContactPage />
                    </div>
                  } />
                  
                  <Route path="/categoria/infantiles" element={
                    <div className="pt-[80px]">
                      <CategoriaInfantil />
                    </div>
                  } />
                  
                  <Route path="/carrito" element={
                    <div className="pt-[80px]">
                      <CartPage />
                    </div>
                  } />
                  
                  {/* Admin routes - SIN padding porque ya tienen su propio layout */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <AdminRoute><AdminDashboard /></AdminRoute>
                  } />
                  <Route path="/admin/producto/:id" element={
                    <AdminRoute><AdminProductForm /></AdminRoute>
                  } />
                  <Route path="/admin/categorias" element={
                    <AdminRoute><AdminCategorias /></AdminRoute>
                  } />
                  <Route path="/admin/masvendidos" element={
                    <AdminRoute><AdminMasVendidos /></AdminRoute>
                  } />
                  <Route path="/admin/ofertas" element={
                    <AdminRoute><AdminOfertas /></AdminRoute>
                  } />
                  <Route path="/admin/change-password" element={
                    <AdminRoute><AdminChangePassword /></AdminRoute>
                  } />
                  <Route path="/admin/shipping" element={
                    <AdminRoute><AdminShipping /></AdminRoute>
                  } />
                  <Route path="/admin/info-line" element={
                    <AdminRoute><AdminInfoLine /></AdminRoute>
                  } />
                  
                  {/* Ruta 404 */}
                  <Route path="*" element={
                    <div className="pt-[80px]">
                      <NotFound />
                    </div>
                  } />
                </Routes>
                
                {/* Elementos flotantes globales */}
                <Footer />
                <MobileBottomBar />
                <ViberButton />
                <ScrollToTop />
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;