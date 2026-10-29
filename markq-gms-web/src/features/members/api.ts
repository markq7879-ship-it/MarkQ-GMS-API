import { apiClient } from "../../lib/api/client";
import type {
  CheckMobileResult,
  Member,
  MemberFormValues,
  MemberListResult,
} from "./types";

export interface MemberListParams {
  search?: string;
  branchId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  filter?: string;
}

export async function listMembers(params: MemberListParams): Promise<MemberListResult> {
  const { data } = await apiClient.get<MemberListResult>("/members", { params });
  return data;
}

export async function getMember(id: string): Promise<Member> {
  const { data } = await apiClient.get<Member>(`/members/${id}`);
  return data;
}

export async function createMember(values: MemberFormValues): Promise<Member> {
  const { data } = await apiClient.post<Member>("/members", values);
  return data;
}

export async function updateMember(id: string, values: MemberFormValues): Promise<Member> {
  const { data } = await apiClient.put<Member>(`/members/${id}`, values);
  return data;
}

export async function checkMobile(
  mobile: string,
  excludeMemberId?: string,
): Promise<CheckMobileResult> {
  const { data } = await apiClient.get<CheckMobileResult>("/members/check-mobile", {
    params: { mobile, excludeMemberId },
  });
  return data;
}

export async function cancelMember(id: string, reason: string): Promise<Member> {
  const { data } = await apiClient.post<Member>(`/members/${id}/cancel`, { reason });
  return data;
}

export async function reactivateMember(id: string): Promise<Member> {
  const { data } = await apiClient.post<Member>(`/members/${id}/reactivate`);
  return data;
}
export async function deleteMember(id: string): Promise<void> {
  await apiClient.delete(`/members/${id}`);
}
