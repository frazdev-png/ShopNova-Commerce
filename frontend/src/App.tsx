import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, CartProvider, ToastProvider, WishlistProvider } from "./store";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import Spinner from "./components/ui/Spinner";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ShopPage = lazy(() => import("./pages/shop/ShopPage"));
const ProductDetailPage = lazy(() => import("./pages/shop/ProductDetailPage"));
const SupportChat = lazy(() => import("./pages/shop/SupportChat"));
const CartPage = lazy(() => import("./pages/CartPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminChatList = lazy(() => import("./pages/admin/AdminChatList"));
const AdminChatDetail = lazy(() => import("./pages/admin/AdminChatDetail"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPage"));
const ReturnsPage = lazy(() => import("./pages/ReturnsPage"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <WishlistProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Customer routes wrapped in Layout */}
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
              <Route path="/product/:id" element={<Layout><ProductDetailPage /></Layout>} />
              <Route path="/cart" element={<Layout><CartPage /></Layout>} />
              <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
              <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Layout><CheckoutPage /></Layout></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute><Layout><MyOrdersPage /></Layout></ProtectedRoute>} />
              <Route path="/order/:id" element={<ProtectedRoute><Layout><OrderDetailPage /></Layout></ProtectedRoute>} />
              <Route path="/support-chat" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
              <Route path="/about" element={<Layout><AboutPage /></Layout>} />
              <Route path="/careers" element={<Layout><CareersPage /></Layout>} />
              <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
              <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
              <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
              <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
              <Route path="/shipping" element={<Layout><ShippingPage /></Layout>} />
              <Route path="/returns" element={<Layout><ReturnsPage /></Layout>} />
              <Route path="*" element={<Layout><NotFoundPage /></Layout>} />

              {/* Admin routes wrapped in AdminLayout - strict admin protection */}
              <Route
                path="/admin"
                element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/create" element={<AdminProductForm />} />
                <Route path="products/edit/:id" element={<AdminProductForm />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="chats" element={<AdminChatList />} />
                <Route path="chat/:id" element={<AdminChatDetail />} />
              </Route>

              {/* Old admin routes redirect */}
              <Route
                path="/admin/dashboard"
                element={<Navigate to="/admin" replace />}
              />
            </Routes>
          </Suspense>
        </ToastProvider>
        </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
