import { apiClient } from "../../lib/api/client";
import type { CreateMembershipValues, FreezeValues, Membership } from "./types";

export async function listMemberships(search?: string, memberId?: string): Promise<Membership[]> {
  const { data } = await apiClient.get<Membership[]>("/memberships", {
    params: { search, memberId },
  });
  return data;
}

export async function createMembership(v: CreateMembershipValues): Promise<Membership> {
  const { data } = await apiClient.post<Membership>("/memberships", v);
  return data;
}

export async function renewMembership(id: string): Promise<Membership> {
  const { data } = await apiClient.post<Membership>(`/memberships/${id}/renew`, {});
  return data;
}

export async function freezeMembership(id: string, v: FreezeValues): Promise<Membership> {
  const { data } = await apiClient.post<Membership>(`/memberships/${id}/freeze`, v);
  return data;
}
