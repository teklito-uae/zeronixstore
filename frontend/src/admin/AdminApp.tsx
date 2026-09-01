import { Route, Routes } from "react-router-dom";
import { AdminAuthProvider } from "@/admin/auth/AuthContext";
import { RequireAdmin } from "@/admin/auth/RequireAdmin";
import { AdminShell } from "@/admin/components/AdminShell";
import Login from "@/admin/pages/Login";
import Dashboard from "@/admin/pages/Dashboard";
import ProductsList from "@/admin/pages/products/ProductsList";
import ProductForm from "@/admin/pages/products/ProductForm";
import OrdersList from "@/admin/pages/orders/OrdersList";
import OrderDetail from "@/admin/pages/orders/OrderDetail";
import CategoriesList from "@/admin/pages/categories/CategoriesList";
import ImportsList from "@/admin/pages/imports/ImportsList";
import ImportDetail from "@/admin/pages/imports/ImportDetail";

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminShell />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="imports" element={<ImportsList />} />
            <Route path="imports/:id" element={<ImportDetail />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
