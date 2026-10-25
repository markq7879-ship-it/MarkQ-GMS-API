export interface RevenueTrendPoint {
  month: string;
  year: number;
  monthNumber: number;
  revenue: number;
}

export interface RevenueTrend {
  points: RevenueTrendPoint[];
  momGrowthPercent: number;
  totalRevenue: number;
  asOf: string;
}

export interface PaymentMethodBreakdownItem {
  method: string;
  amount: number;
  count: number;
}

export interface PaymentMethodBreakdown {
  methods: PaymentMethodBreakdownItem[];
  total: number;
}
