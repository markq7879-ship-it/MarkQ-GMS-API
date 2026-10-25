import { apiClient } from "../../lib/api/client";

export interface OrganizationSettings {
  id: string;
  name: string;
  gstEnabled: boolean;
  gstPercent: number;
  gstIncludedInPrice: boolean;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface UpdateSettingsValues {
  name: string;
  gstEnabled: boolean;
  gstPercent: number;
  gstIncludedInPrice: boolean;
  address?: string;
  phone?: string;
  email?: string;
}

export async function getSettings(): Promise<OrganizationSettings> {
  const { data } = await apiClient.get<OrganizationSettings>("/settings");
  return data;
}

export async function updateSettings(v: UpdateSettingsValues): Promise<OrganizationSettings> {
  const { data } = await apiClient.put<OrganizationSettings>("/settings", v);
  return data;
}