import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import ComingSoon from "@/pages/ComingSoon";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Category from "@/pages/Category";
import Search from "@/pages/Search";
import Account from "@/pages/Account";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Journal from "@/pages/Journal";
import JournalDetail from "@/pages/JournalDetail";
import AdminApp from "@/admin/AdminApp";
import { CartProvider } from "@/features/cart/CartContext";
import { WishlistProvider } from "@/features/wishlist/WishlistContext";
import { AuthProvider } from "@/features/auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/admin/*" element={<AdminApp />} />
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/search" element={<Search />} />
                <Route path="/account" element={<Account />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/journal/:slug" element={<JournalDetail />} />
                <Route path="*" element={<ComingSoon />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
