import { apiClient } from "../../lib/api/client";
import type { MembershipPlan, MembershipPlanFormValues } from "./types";

export async function listPlans(search?: string): Promise<MembershipPlan[]> {
  const { data } = await apiClient.get<MembershipPlan[]>("/membership-plans", { params: { search } });
  return data;
}

export async function createPlan(v: MembershipPlanFormValues): Promise<MembershipPlan> {
  const { data } = await apiClient.post<MembershipPlan>("/membership-plans", v);
  return data;
}

export async function updatePlan(id: string, v: MembershipPlanFormValues): Promise<MembershipPlan> {
  const { data } = await apiClient.put<MembershipPlan>(`/membership-plans/${id}`, v);
  return data;
}

export async function setPlanStatus(id: string, isActive: boolean): Promise<void> {
  await apiClient.post(`/membership-plans/${id}/status`, { isActive });
}