import { apiClient } from "../../lib/api/client";
import type { CreateUserValues, UpdateUserValues, UserSummary } from "./types";

export async function listUsers(search?: string): Promise<UserSummary[]> {
  const { data } = await apiClient.get<UserSummary[]>("/users", { params: { search } });
  return data;
}

export async function createUser(v: CreateUserValues): Promise<UserSummary> {
  const { data } = await apiClient.post<UserSummary>("/users", v);
  return data;
}

export async function updateUser(id: string, v: UpdateUserValues): Promise<UserSummary> {
  const { data } = await apiClient.put<UserSummary>(`/users/${id}`, v);
  return data;
}

export async function assignBranches(id: string, branchIds: string[]): Promise<void> {
  await apiClient.post(`/users/${id}/branches`, { branchIds });
}

export async function setUserStatus(id: string, isActive: boolean): Promise<void> {
  await apiClient.post(`/users/${id}/status`, { isActive });
}