import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/admin/auth/AuthContext";
import { Loader2 } from "lucide-react";

export function RequireAdmin() {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
