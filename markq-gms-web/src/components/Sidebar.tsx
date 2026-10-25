import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, Calendar, Wallet,
  TrendingUp, FileBarChart, UserCog, Building2, Settings, Dumbbell,
} from "lucide-react";
import { useAuthStore } from "../features/auth/authStore";
import { premiumFeatures } from "../config/premiumFeatures";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  ownerOnly?: boolean;
}

const mainItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/membership-plans", label: "Membership Plans", icon: CreditCard },
  { to: "/memberships", label: "Memberships", icon: Calendar },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/other-income", label: "Other Income", icon: TrendingUp },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/branches", label: "Branches", icon: Building2, ownerOnly: true },
  { to: "/users", label: "Users", icon: UserCog, ownerOnly: true },
  // { to: "/settings", label: "Settings", icon: Settings, ownerOnly: true },
];

export default function Sidebar() {
  const isOwner = useAuthStore((s) => s.user?.role === "OWNER");

  return (
    <aside className="sidebar-nav w-72 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="logo-text text-white">Mark-Q GMS</p>
          <p className="logo-sub text-slate-400">Gym Management</p>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {/* MAIN section */}
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Main
        </p>

        {mainItems.filter((it) => !it.ownerOnly || isOwner).map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/"}
              className={({ isActive }) =>
                `nav-item gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{it.label}</span>
            </NavLink>
          );
        })}

        {/* PRO section divider */}
        <div className="pt-4 mt-3 border-t border-slate-800">
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">
              Pro · Coming Soon
            </p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {premiumFeatures.length}
            </span>
          </div>
        </div>

        {premiumFeatures.map((f) => {
          const Icon = f.icon;
          const isSoon = f.tier === "SOON";
          return (
            <NavLink
              key={f.slug}
              to={`/pro/${f.slug}`}
              className={({ isActive }) =>
                `nav-item gap-3 px-3 py-2 rounded-lg transition-colors group ${
                  isActive
                    ? isSoon
                      ? "bg-purple-600/90 text-white"
                      : "bg-indigo-600/90 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "" : isSoon ? "text-purple-400/70" : "text-amber-400/70"}`} />
                  <span className="truncate flex-1">{f.shortLabel}</span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      isSoon
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {f.tier}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="version px-4 py-3 border-t border-slate-800 shrink-0 space-y-1">
        <p className="text-slate-500 text-[10.5px] font-semibold tracking-wide">
          v0.1 · development
        </p>
        <p className="text-slate-500 text-[10px] font-medium leading-relaxed">
          © 2026 <span className="text-slate-400 font-bold">Mark-Q GMS</span> · All rights reserved
        </p>
        <p className="text-slate-500 text-[10px] font-medium leading-relaxed">
          Developed by <span className="text-indigo-400 font-bold">MarkQ Infotech</span>
        </p>
      </div>
    </aside>
  );
}



