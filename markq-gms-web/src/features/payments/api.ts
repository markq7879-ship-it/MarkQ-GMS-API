import { apiClient } from "../../lib/api/client";
import type { CreatePaymentValues, Payment, VoidPaymentValues } from "./types";

export async function listPayments(search?: string): Promise<Payment[]> {
  const { data } = await apiClient.get<Payment[]>("/payments", { params: { search } });
  return data;
}

export async function getPayment(id: string): Promise<Payment> {
  const { data } = await apiClient.get<Payment>(`/payments/${id}`);
  return data;
}

export async function createPayment(v: CreatePaymentValues): Promise<Payment> {
  const { data } = await apiClient.post<Payment>("/payments", v);
  return data;
}

export async function voidPayment(id: string, v: VoidPaymentValues): Promise<void> {
  await apiClient.post(`/payments/${id}/void`, v);
}
