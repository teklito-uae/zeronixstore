import { apiRequest, clearToken, setToken } from "./client";
import type { Address, Order, User } from "./types";

interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const res = await apiRequest<AuthResponse>("/auth/register", { method: "POST", body: { name, email, password } });
  setToken(res.access_token);
  return res.user;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await apiRequest<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
  setToken(res.access_token);
  return res.user;
}

export async function fetchMe(): Promise<User> {
  return apiRequest<User>("/auth/user");
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}

export async function fetchOrders(): Promise<Order[]> {
  return apiRequest<Order[]>("/orders");
}

export async function fetchAddresses(): Promise<Address[]> {
  return apiRequest<Address[]>("/addresses");
}

export type AddressInput = Omit<Address, "id" | "is_default"> & { is_default?: boolean };

export async function createAddress(data: AddressInput): Promise<Address> {
  return apiRequest<Address>("/addresses", { method: "POST", body: data });
}

export async function updateAddress(id: number, data: Partial<AddressInput>): Promise<Address> {
  return apiRequest<Address>(`/addresses/${id}`, { method: "PUT", body: data });
}

export async function deleteAddress(id: number): Promise<void> {
  return apiRequest<void>(`/addresses/${id}`, { method: "DELETE" });
}

export async function makeDefaultAddress(id: number): Promise<Address> {
  return apiRequest<Address>(`/addresses/${id}/default`, { method: "POST" });
}
