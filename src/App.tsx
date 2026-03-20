import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
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
import PerfilPage from "./pages/PerfilPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminMasVendidos from "./pages/admin/AdminMasVendidos";
import AdminOfertas from "./pages/admin/AdminOfertas";
import AdminNuevos from "./pages/admin/AdminNuevos";
import AdminChangePassword from "./pages/admin/AdminChangePassword";
import AdminShipping from "./pages/admin/AdminShipping";
import AdminInfoLine from "./pages/admin/AdminInfoLine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const MainSliderForDevice = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <MobileHero /> : <MainSlider />;
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && (
        <>
          <Navbar />
          <InfoLine />
        </>
      )}
      
      <Routes>
        <Route path="/" element={
          <>
            <MainSliderForDevice />
            <Index />
          </>
        } />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/puntos" element={<PuntosPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/categoria/infantiles" element={<CategoriaInfantil />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        
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
        <Route path="/admin/nuevos" element={
          <AdminRoute><AdminNuevos /></AdminRoute>
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
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Footer eliminado de aquí - se controlará dentro de Index */}
      
      <ScrollToTop />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <UserProfileProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </UserProfileProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;