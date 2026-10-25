import { Link } from "react-router-dom";
import { Users, Wallet, AlertCircle, FileBarChart, TrendingUp, Building2, ScrollText } from "lucide-react";
import PageHeader from "../../components/PageHeader";

interface ReportCard {
  to: string;
  title: string;
  description: string;
  icon: typeof Users;
  color: string;
}

const reports: ReportCard[] = [
  { to: "/reports/members", title: "Member Report", description: "Filter by branch, status and date joined.", icon: Users, color: "text-indigo-600 bg-indigo-50" },
  { to: "/reports/revenue", title: "Revenue Report", description: "Payments grouped by date, branch and method.", icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
  { to: "/reports/pending-payments", title: "Pending Payment Report", description: "Members with outstanding balance.", icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
  { to: "/reports/expired-memberships", title: "Expired Membership Report", description: "Members whose memberships have expired.", icon: FileBarChart, color: "text-rose-600 bg-rose-50" },
  { to: "/reports/income", title: "Income Report", description: "Membership + other income combined.", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
  { to: "/reports/branch-comparison", title: "Branch Comparison", description: "Compare branches on revenue and members.", icon: Building2, color: "text-slate-600 bg-slate-100" },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Analytics and exports." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.to} to={r.to}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${r.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-slate-800 mt-3">{r.title}</p>
              <p className="text-sm text-slate-500 mt-1">{r.description}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-8 bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ScrollText className="w-5 h-5 text-slate-400 mt-0.5" />
          <p className="text-sm text-slate-500">
            Attendance, Expense and Trainer Performance reports are not applicable to this client's scope.
          </p>
        </div>
      </div>
    </div>
  );
}
