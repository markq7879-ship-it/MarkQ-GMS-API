export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiringToday: number;
  expiringIn7Days: number;
  inactiveMembers: number;
  activeBranches: number;
  newMembersToday: number;
  newMembersThisMonth: number;
  pendingMembersCount: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalPendingAmount: number;
  revenueAvailable: boolean;
  pendingAvailable: boolean;
  attendanceAvailable: boolean;
  presentToday: number;
  asOf: string;
}
