import { apiClient } from "../../lib/api/client";
import type { DashboardStats } from "./types";
import type { RevenueTrend, PaymentMethodBreakdown } from "./revenueTrendTypes";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
  return data;
}

export async function getRevenueTrend(months = 6): Promise<RevenueTrend> {
  const { data } = await apiClient.get<RevenueTrend>("/dashboard/revenue-trend", {
    params: { months },
  });
  return data;
}

export async function getPaymentMethods(): Promise<PaymentMethodBreakdown> {
  const { data } = await apiClient.get<PaymentMethodBreakdown>("/dashboard/payment-methods");
  return data;
}
