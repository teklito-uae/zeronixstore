import { apiRequest, clearToken, setToken } from "@/admin/api/client";
import type { AdminUser } from "@/admin/types";

interface LoginResponse {
  user: AdminUser;
  access_token: string;
  token_type: string;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const res = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(res.access_token);
  return res.user;
}

export async function fetchMe(): Promise<AdminUser> {
  return apiRequest<AdminUser>("/auth/user");
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}
