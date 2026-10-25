export interface MembershipPlan {
  id: string;
  name: string;
  durationDays: number;
  basePrice: number;
  registrationFee: number;
  discount: number;
  gstPercent: number;
  gstIncluded: boolean;
  freezeEligible: boolean;
  maxFreezeDays: number;
  isActive: boolean;
}

export interface MembershipPlanFormValues {
  name: string;
  durationDays: number;
  basePrice: number;
  registrationFee: number;
  discount: number;
  gstPercent: number;
  gstIncluded: boolean;
  freezeEligible: boolean;
  maxFreezeDays: number;
}