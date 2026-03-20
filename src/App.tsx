import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Index from "@/pages/Index";
import CategoryPage from "@/pages/CategoryPage";
import ProductDetail from "@/pages/ProductDetail";
import CartPage from "@/pages/CartPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import PerfilPage from "@/pages/PerfilPage";
import PuntosPage from "@/pages/PuntosPage";
import CategoriaInfantil from "@/pages/CategoriaInfantil";
import NotFound from "@/pages/NotFound";

// Admin
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProductForm from "@/pages/admin/AdminProductForm";
import AdminMasVendidos from "@/pages/admin/AdminMasVendidos";
import AdminOfertas from "@/pages/admin/AdminOfertas";
import AdminNuevos from "@/pages/admin/AdminNuevos";
import AdminCategorias from "@/pages/admin/AdminCategorias";
import AdminShipping from "@/pages/admin/AdminShipping";
import AdminInfoLine from "@/pages/admin/AdminInfoLine";
import AdminChangePassword from "@/pages/admin/AdminChangePassword";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import MobileBottomBar from "@/components/MobileBottomBar";
import ViberButton from "@/components/ViberAppButton";
import InfoLine from "@/components/InfoLine";
import { useInfoLine } from "@/hooks/useInfoLine";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { config: infoLineConfig } = useInfoLine();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname === '/admin' || location.pathname === '/admin/login';

  // Manejo mejorado del scroll en móviles
  useEffect(() => {
    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const isAtTop = scrollTop <= 5;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

      // Solo prevenir el pull-to-refresh cuando estamos en el TOP
      if (isAtTop && deltaY > 10) {
        e.preventDefault();
        return false;
      }
      
      // Solo prevenir el overscroll cuando estamos en el BOTTOM
      if (isAtBottom && deltaY < -10) {
        e.preventDefault();
        return false;
      }
    };

    // Solo aplicar en móviles (touch screen)
    const isTouchDevice = 'ontouchstart' in window;
    
    if (isTouchDevice) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    
    return () => {
      if (isTouchDevice) {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && infoLineConfig?.activo && <InfoLine />}
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categoria/:slug" element={<CategoryPage />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/puntos" element={<PuntosPage />} />
          <Route path="/categoria-infantil" element={<CategoriaInfantil />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/producto/:id" element={<AdminProductForm />} />
          <Route path="/admin/masvendidos" element={<AdminMasVendidos />} />
          <Route path="/admin/ofertas" element={<AdminOfertas />} />
          <Route path="/admin/nuevos" element={<AdminNuevos />} />
          <Route path="/admin/categorias" element={<AdminCategorias />} />
          <Route path="/admin/shipping" element={<AdminShipping />} />
          <Route path="/admin/info-line" element={<AdminInfoLine />} />
          <Route path="/admin/change-password" element={<AdminChangePassword />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && !isLoginRoute && <Footer />}
      {!isAdminRoute && !isLoginRoute && <MobileBottomBar />}
      {!isAdminRoute && !isLoginRoute && <ViberButton />}
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <UserProfileProvider>
                <TooltipProvider>
                  <AppContent />
                  <Toaster position="top-right" richColors />
                </TooltipProvider>
              </UserProfileProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;