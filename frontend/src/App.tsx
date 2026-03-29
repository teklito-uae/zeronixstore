import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { Layout } from './components/layout/Layout';
import { AppLoaderSkeleton } from './components/ui/skeletons/AppLoaderSkeleton';

// Lazy-loaded Pages
const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const Scraper = lazy(() => import('./pages/admin/Scraper'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

export default function App() {
  const { checkAuth, isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <AppLoaderSkeleton />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<AppLoaderSkeleton />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="category/*" element={<CategoryPage />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            
            <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            
            <Route path="checkout" element={isAuthenticated ? <Checkout /> : <Navigate to="/login?redirect=checkout" />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard/*" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login?redirect=dashboard" />} />
          </Route>
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/" />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="scraper" element={<Scraper />} />
            <Route path="users" element={<div className="p-8">Users management coming soon</div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
