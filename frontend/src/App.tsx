import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { Layout } from './components/layout/Layout';

// Placeholder Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import Scraper from './pages/admin/Scraper';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import { AppLoaderSkeleton } from './components/ui/skeletons/AppLoaderSkeleton';

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
    </BrowserRouter>
  );
}
