import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, UserCheck, UserX, Wallet, TrendingUp, Building2,
  UserPlus, Calendar, AlertTriangle, Clock, CheckSquare, XCircle, ChevronRight,
  BarChart3, Activity
} from "lucide-react";
import { useAuthStore } from "../auth/authStore";
import { getDashboardStats, getRevenueTrend, getPaymentMethods } from "./api";

/* ============================================================
   Live Date & Time
   ============================================================ */
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function LiveClockBar() {
  const now = useNow(1000);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-emerald-600">
            Live
          </span>
        </div>
        <span className="text-slate-300 text-sm">·</span>
        <p className="text-sm font-bold text-slate-800 truncate">{dateStr}</p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="font-mono font-extrabold text-indigo-700 tabular-nums">
          {timeStr}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Systems operational
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   Analytics Charts — Revenue Trend + Payment Methods (Real Data)
   ============================================================ */
function AnalyticsCharts() {
  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ["revenue-trend", 6],
    queryFn: () => getRevenueTrend(6),
    staleTime: 60_000,
  });

  const { data: methods, isLoading: methodsLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: getPaymentMethods,
    staleTime: 60_000,
  });

  const revenueHistory = trend?.points ?? [];
  const momGrowth = trend?.momGrowthPercent ?? 0;
  const totalRevenue = trend?.totalRevenue ?? 0;
  const maxRevenue = Math.max(...revenueHistory.map((r) => r.revenue), 1);

  const methodBreakdown = methods?.methods ?? [];
  const totalMethodRevenue = methods?.total ?? 0;

  const methodColors: Record<string, string> = {
    CASH: "bg-emerald-500",
    UPI: "bg-indigo-500",
    BANK_TRANSFER: "bg-sky-500",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Trend Chart */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Financial Growth & Projections</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Last 6 months revenue performance across assigned branches</p>
          </div>
          {momGrowth !== 0 && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                momGrowth >= 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              MoM {momGrowth >= 0 ? "+" : ""}{momGrowth.toFixed(1)}%
            </span>
          )}
        </div>

        <div className="pt-2">
          {trendLoading ? (
            <div className="h-44 flex items-center justify-center text-slate-500 text-sm font-semibold">
              Loading trend data…
            </div>
          ) : totalRevenue === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center">
              <BarChart3 className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No revenue recorded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Chart will populate automatically as members make payments.
              </p>
            </div>
          ) : (
            <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 px-2">
              {revenueHistory.map((item, idx) => {
                const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                const isCurrentMonth = idx === revenueHistory.length - 1;

                return (
                  <div
                    key={`${item.year}-${item.monthNumber}`}
                    className="flex-1 flex flex-col items-center h-full justify-end group"
                  >
                    <div className="text-[11px] font-bold text-slate-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{(item.revenue / 1000).toFixed(1)}k
                    </div>
                    <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden h-32 flex items-end">
                      <div
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                        className={`w-full transition-all duration-500 rounded-t-lg ${
                          isCurrentMonth
                            ? "bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/20"
                            : "bg-slate-300 group-hover:bg-indigo-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs mt-2 font-semibold ${
                        isCurrentMonth ? "text-indigo-600 font-bold" : "text-slate-500"
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Payment Methods</h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md">
            All time
          </span>
        </div>

        {methodsLoading ? (
          <div className="h-44 flex items-center justify-center text-slate-500 text-sm font-semibold">
            Loading…
          </div>
        ) : methodBreakdown.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center">
            <Activity className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No payments recorded</p>
            <p className="text-xs text-slate-500 mt-1">Add a payment to see method breakdown</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {methodBreakdown.map((m) => {
              const pct = totalMethodRevenue > 0 ? Math.round((m.amount / totalMethodRevenue) * 100) : 0;
              return (
                <div key={m.method} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">{m.method.replace(/_/g, " ")}</span>
                    <span className="text-slate-800">
                      ₹{m.amount.toLocaleString("en-IN")} · {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all ${methodColors[m.method] ?? "bg-slate-400"}`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {m.count} transaction{m.count !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Main Dashboard Page
   ============================================================ */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  return (
    <div className="dashboard-surface space-y-6 pb-12 font-sans">
      <LiveClockBar />

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Signed in as {user?.role ?? "OWNER"} · {user?.branchIds?.length ?? 0} Branch(es) Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.fullName ?? "Gym Owner"} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {isLoading ? "Loading live stats…" : "Click any metric card to review underlying member and ledger records."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate("/members")}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> <span>New Member</span>
            </button>
            <button
              onClick={() => navigate("/payments")}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <Wallet className="w-4 h-4" /> <span>Record Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Membership Metrics */}
      <Section title="Membership Overview">
        <KpiCard
          label="Total Members"
          value={data?.totalMembers}
          icon={Users}
          color="text-indigo-600 bg-indigo-50 border-indigo-100"
          hint={data ? `${data.newMembersThisMonth} joined this month` : undefined}
          to="/members"
        />
        <KpiCard
          label="Active Members"
          value={data?.activeMembers}
          icon={UserCheck}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
          hint="Have an active membership"
          to="/members?filter=active"
        />
        <KpiCard
          label="Inactive Members"
          value={data?.inactiveMembers}
          icon={UserX}
          color="text-slate-600 bg-slate-100 border-slate-200"
          hint="No active membership"
          to="/members?filter=inactive"
        />
        <KpiCard
          label="Expiring in 7 Days"
          value={data?.expiringIn7Days}
          icon={Clock}
          color="text-amber-600 bg-amber-50 border-amber-100"
          hint="Renewal upcoming"
          to="/members?filter=expiring7"
        />
      </Section>

      {/* Today's Activity */}
      <Section title="Today's Activity">
        <KpiCard
          label="New Members Today"
          value={data?.newMembersToday}
          icon={UserPlus}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
          to="/members?filter=newtoday"
        />
        <KpiCard
          label="Expiring Today"
          value={data?.expiringToday}
          icon={Calendar}
          color="text-amber-600 bg-amber-50 border-amber-100"
          hint="Membership ends today"
          to="/members?filter=expiringtoday"
        />
        <KpiCard
          label="Present Today"
          value={data?.presentToday}
          icon={CheckSquare}
          color="text-sky-600 bg-sky-50 border-sky-100"
          blocked={data ? !data.attendanceAvailable : false}
          blockedText="Attendance disabled"
        />
        <KpiCard
          label="Active Branches"
          value={data?.activeBranches}
          icon={Building2}
          color="text-slate-600 bg-slate-100 border-slate-200"
          to="/branches"
        />
      </Section>

      {/* Financials */}
      <Section title="Financials">
        <KpiCard
          label="Today's Revenue"
          value={data?.todayRevenue}
          icon={Wallet}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
          isCurrency
          to="/payments"
        />
        <KpiCard
          label="Monthly Revenue"
          value={data?.monthlyRevenue}
          icon={TrendingUp}
          color="text-indigo-600 bg-indigo-50 border-indigo-100"
          isCurrency
          to="/payments"
        />
        <KpiCard
          label="Pending Amount"
          value={data?.totalPendingAmount}
          icon={AlertTriangle}
          color="text-rose-600 bg-rose-50 border-rose-100"
          isCurrency
          hint={data ? `${data.pendingMembersCount} members with balance` : undefined}
          to="/members?filter=pending"
        />
        <KpiCard
          label="Members with Due"
          value={data?.pendingMembersCount}
          icon={XCircle}
          color="text-rose-600 bg-rose-50 border-rose-100"
          to="/members?filter=pending"
        />
      </Section>

      {/* Analytics Charts */}
      <AnalyticsCharts />

      {/* Setup Progress */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">System Setup Progress</h2>
            <p className="text-xs text-slate-500 mt-0.5">Modules marked complete are fully operational.</p>
          </div>
          <SetupProgress />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4">
          {SETUP_STEPS.map((item) => {
            const isCompleted = item.status === "completed";
            const isCurrent = item.status === "current";
            return (
              <div
                key={item.step}
                className={`relative p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                    : isCurrent
                    ? "bg-indigo-50/60 border-indigo-300 shadow-sm text-indigo-950"
                    : "bg-white border-slate-200 opacity-75"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isCompleted ? "✓" : item.step}
                  </span>
                </div>
                <p className="text-xs font-semibold mt-1 leading-tight">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Section Wrapper
   ============================================================ */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">{children}</div>
    </div>
  );
}

/* ============================================================
   KPI Card
   ============================================================ */
interface KpiCardProps {
  label: string;
  value?: number;
  icon: typeof Users;
  color: string;
  hint?: string;
  isCurrency?: boolean;
  blocked?: boolean;
  blockedText?: string;
  to?: string;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  hint,
  isCurrency,
  blocked,
  blockedText,
  to,
}: KpiCardProps) {
  const display = blocked
    ? "—"
    : value === undefined
    ? "—"
    : isCurrency
    ? "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : value.toLocaleString("en-IN");

  const isPlaceholder = display === "—";
  const clickable = !!to && !blocked;

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${color} transition-transform group-hover:scale-105 duration-200`}>
          <Icon className="w-4 h-4" />
        </div>
        {blocked ? (
          <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px]">
            <AlertTriangle className="w-2.5 h-2.5" /> {blockedText ?? "Unavailable"}
          </span>
        ) : clickable ? (
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        ) : null}
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-black tracking-tight ${isPlaceholder ? "text-slate-300" : "text-slate-900"}`}>
          {display}
        </p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </>
  );

  const baseClasses = `group bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm transition-all duration-200 ${
    clickable ? "hover:shadow-md hover:border-indigo-300 cursor-pointer" : ""
  }`;

  if (clickable && to) {
    return (
      <Link to={to} className={baseClasses}>
        {inner}
      </Link>
    );
  }
  return <div className={baseClasses}>{inner}</div>;
}

/* ============================================================
   Setup Progress Steps
   ============================================================ */
const SETUP_STEPS: {
  step: number;
  title: string;
  status: "completed" | "current" | "active" | "upcoming";
}[] = [
  { step: 1, title: "Authentication", status: "completed" },
  { step: 2, title: "Branches", status: "completed" },
  { step: 3, title: "Members", status: "completed" },
  { step: 4, title: "Membership Plans", status: "completed" },
  { step: 5, title: "Memberships", status: "completed" },
  { step: 6, title: "Payments & Receipts", status: "completed" },
];

function SetupProgress() {
  const total = SETUP_STEPS.length;
  const done = SETUP_STEPS.filter((s) => s.status === "completed").length;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-right">
        <span className="text-xs font-semibold text-slate-400 block">Progress</span>
        <p className="text-xs font-extrabold text-emerald-600">{pct}% Complete</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200 text-emerald-700 font-bold text-xs">
        {done}/{total}
      </div>
    </div>
  );
}
