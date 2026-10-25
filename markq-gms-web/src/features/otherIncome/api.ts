import { apiClient } from "../../lib/api/client";
import type { OtherIncome, OtherIncomeFormValues } from "./types";

export async function listOtherIncome(search?: string): Promise<OtherIncome[]> {
  const { data } = await apiClient.get<OtherIncome[]>("/other-income", { params: { search } });
  return data;
}

export async function createOtherIncome(v: OtherIncomeFormValues): Promise<OtherIncome> {
  const { data } = await apiClient.post<OtherIncome>("/other-income", v);
  return data;
}

export async function updateOtherIncome(id: string, v: OtherIncomeFormValues): Promise<OtherIncome> {
  const { data } = await apiClient.put<OtherIncome>(`/other-income/${id}`, v);
  return data;
}