import { apiClient } from "../../lib/api/client";
import type { Branch } from "./types";

export async function listBranches(search?: string): Promise<Branch[]> {
  const { data } = await apiClient.get<Branch[]>("/branches", { params: { search } });
  return data;
}

export async function createBranch(name: string): Promise<Branch> {
  const { data } = await apiClient.post<Branch>("/branches", { name });
  return data;
}

export async function updateBranch(id: string, name: string): Promise<Branch> {
  const { data } = await apiClient.put<Branch>(`/branches/${id}`, { name });
  return data;
}

export async function setBranchStatus(id: string, isActive: boolean): Promise<void> {
  await apiClient.post(`/branches/${id}/status`, { isActive });
}