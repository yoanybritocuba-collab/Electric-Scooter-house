import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AdminRoute } from "@/components/AdminRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
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
import AdminChangePassword from "./pages/admin/AdminChangePassword"; // 👈 NUEVO
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/categoria/:slug" element={<CategoryPage />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/categoria/infantiles" element={<CategoriaInfantil />} />
                <Route path="/carrito" element={<CartPage />} />
                
                {/* Admin routes */}
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
                <Route path="/admin/change-password" element={ // 👈 NUEVA RUTA
                  <AdminRoute>
                    <AdminChangePassword />
                  </AdminRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
              <WhatsAppButton />
              <ScrollToTop />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;