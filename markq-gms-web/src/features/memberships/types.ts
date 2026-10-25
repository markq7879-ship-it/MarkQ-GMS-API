export type MembershipStatus = "ACTIVE" | "EXPIRED" | "FROZEN" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PARTIALLY_PAID" | "PAID";

export interface Membership {
  id: string;
  membershipNumber: string;
  memberId: string;
  memberCode: string;
  memberName: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  frozenFrom?: string | null;
  frozenTo?: string | null;
  freezeReason?: string | null;
  paymentDueDate?: string | null;
  notes?: string | null;
  discountReason?: string | null;
  endDateOverridden: boolean;
  endDateOverrideReason?: string | null;
  basePrice: number;
  registrationFee: number;
  discount: number;
  gstPercent: number;
  gstIncluded: boolean;
  totalPayable: number;
  totalPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
}

export interface CreateMembershipValues {
  memberId: string;
  planId: string;
  startDate: string;
  endDateOverride?: string;
  endDateOverrideReason?: string;
  registrationFeeOverride?: number;
  discountOverride?: number;
  discountReason?: string;
  paymentDueDate?: string;
  notes?: string;
}

export interface FreezeValues {
  freezeFrom: string;
  freezeTo: string;
  reason: string;
}
