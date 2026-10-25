import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="page-surface flex-1 overflow-y-auto px-6 py-5">
          <Outlet />
        </main>
        <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap text-[11px] text-slate-500 font-semibold">
            <span>
              © 2026 <span className="text-slate-700 font-bold">Mark-Q GMS</span>
              <span className="text-slate-300 mx-1.5">·</span>
              All rights reserved
            </span>
            <span>
              Developed by{" "}
              <span className="text-indigo-600 font-bold">MarkQ Infotech</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
