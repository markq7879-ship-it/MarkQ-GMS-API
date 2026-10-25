import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "./authStore";

interface Props { children: ReactNode; roles?: Array<"OWNER" | "ADMIN">; }

export default function ProtectedRoute({ children, roles }: Props) {
  const { status, user } = useAuthStore();

  if (status === "idle" || status === "loading")
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;

  if (status !== "authenticated" || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
