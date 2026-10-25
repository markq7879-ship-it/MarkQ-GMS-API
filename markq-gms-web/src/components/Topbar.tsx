import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../features/auth/authStore";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = (user?.fullName ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0"
      style={{ fontFamily: "'Calibri', 'Segoe UI', sans-serif" }}>
      <div>
        <p className="text-[12px] font-semibold text-slate-500 leading-tight">Branch</p>
        <p className="text-[14px] font-bold text-slate-800 leading-tight">All Branches</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-md hover:bg-slate-100 text-slate-600" title="Notifications">
          <Bell className="w-5 h-5" />
        </button>

        <div ref={ref} className="relative">
          <button onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-slate-100">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[12px] font-bold">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-bold text-slate-800 leading-tight">{user?.fullName}</p>
              <p className="text-[11px] font-semibold text-slate-500 leading-tight">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[13px] font-bold text-slate-800">{user?.fullName}</p>
                <p className="text-[12px] font-medium text-slate-500 truncate">{user?.email}</p>
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50">
                <UserIcon className="w-4 h-4" /> Profile
              </button>
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
