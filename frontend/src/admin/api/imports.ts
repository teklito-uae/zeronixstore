import { apiRequest } from "@/admin/api/client";
import type { ImportJob, ImportLog } from "@/admin/types";

export async function listRecentImports(): Promise<ImportJob[]> {
  return apiRequest<ImportJob[]>("/admin/imports");
}

export interface StartUrlImportPayload {
  source_category_url: string;
  local_category_id: number;
}

export async function startUrlImport(payload: StartUrlImportPayload): Promise<ImportJob> {
  const res = await apiRequest<{ job: ImportJob }>("/admin/imports/start", {
    method: "POST",
    body: payload,
  });
  return res.job;
}

export interface StartMicrolessImportPayload {
  local_category_id: number;
  category_id?: string;
  brands?: string;
  query?: string;
}

export async function startMicrolessImport(
  payload: StartMicrolessImportPayload,
): Promise<ImportJob> {
  const res = await apiRequest<{ job: ImportJob }>("/admin/imports/microless/start", {
    method: "POST",
    body: payload,
  });
  return res.job;
}

export interface StartJsonImportPayload {
  local_category_id: number;
  products: unknown[];
  category_brands_str?: string;
}

export async function startJsonImport(payload: StartJsonImportPayload): Promise<ImportJob> {
  const res = await apiRequest<{ job: ImportJob }>("/admin/imports/json", {
    method: "POST",
    body: payload,
  });
  return res.job;
}

export interface ImportStatusResponse {
  job: ImportJob;
  percentage: number;
  logs: ImportLog[];
}

export async function getImportStatus(id: number): Promise<ImportStatusResponse> {
  return apiRequest<ImportStatusResponse>(`/admin/imports/${id}/status`);
}

export async function stopImport(id: number): Promise<ImportJob> {
  const res = await apiRequest<{ job: ImportJob }>(`/admin/imports/${id}/stop`, {
    method: "POST",
  });
  return res.job;
}

export async function rerunFailedImport(id: number): Promise<void> {
  await apiRequest<void>(`/admin/imports/${id}/rerun-failed`, { method: "POST" });
}
