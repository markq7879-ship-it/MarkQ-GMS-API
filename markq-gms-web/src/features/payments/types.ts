export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER";
export type PaymentStatus = "COMPLETED" | "VOIDED";

export interface Payment {
  id: string;
  receiptNumber: string;
  membershipId: string;
  membershipNumber: string;
  memberId: string;
  memberCode: string;
  memberName: string;
  memberMobile: string;
  memberWhatsApp?: string | null;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  paidAt: string;
  status: PaymentStatus;
  receivedByName: string;
  voidedAt?: string | null;
  voidReason?: string | null;
  voidedByName?: string | null;
  notes?: string | null;
  membershipTotal: number;
  paidBefore: number;
  balanceBefore: number;
  balanceAfter: number;
}

export interface CreatePaymentValues {
  membershipId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface VoidPaymentValues {
  reason: string;
}
