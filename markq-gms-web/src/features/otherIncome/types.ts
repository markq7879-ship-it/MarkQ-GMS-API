export type OtherIncomeCategory =
  | "PERSONAL_TRAINING" | "SUPPLEMENTS" | "MERCHANDISE" | "SERVICE" | "OTHER";

export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER";

export interface OtherIncome {
  id: string;
  branchId: string;
  branchName: string;
  category: OtherIncomeCategory;
  amount: number;
  incomeDate: string;
  method: PaymentMethod;
  description?: string | null;
  createdAt: string;
}

export interface OtherIncomeFormValues {
  branchId: string;
  category: OtherIncomeCategory;
  amount: number;
  incomeDate: string;
  method: PaymentMethod;
  description?: string;
}