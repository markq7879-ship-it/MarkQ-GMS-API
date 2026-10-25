import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "./api";
import { useAuthStore } from "./authStore";
import { Mail, Lock, Eye, EyeOff, Dumbbell, AlertCircle, Loader2, ShieldCheck, Zap, Activity } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await login(values.email, values.password);
      setAuth(res.accessToken, res.user);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? "Login failed. Check your credentials.";
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Left Column: Hero Branding & Dynamic Background */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-slate-900 justify-between flex-col p-12">
        {/* Gym Background Image with Dark Vignette and Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-10000 ease-out"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/90" />

        {/* Top Branding Badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">Mark-Q</span>
            <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              GMS PRO
            </span>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-indigo-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Next-Gen Gym Management Platform</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
            Empower Your Fitness Enterprise.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Manage memberships, track check-ins, streamline recurring revenues, and scale multi-branch gyms seamlessly with unified analytics.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Branch Access</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Live Attendance Sync</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Automated Billing</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <p>© {new Date().getFullYear()} Mark-Q Technologies. All rights reserved.</p>
          <span className="text-slate-500">v2.4.0 • Enterprise Edition</span>
        </div>
      </div>

      {/* Right Column: Glassmorphism Form Area */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-slate-950 relative">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile Header (Shows only on small screens) */}
          <div className="lg:hidden text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-600/30 mb-2">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mark-Q GMS</h1>
            <p className="text-xs text-slate-400">Sign in to manage your gym network</p>
          </div>

          {/* Form Card Header */}
          <div className="hidden lg:block space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-400">Please enter your credentials to access your portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Server Error Alert */}
            {serverError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="owner@gymdomain.com"
                  {...register("email")}
                  className={`w-full bg-slate-900/90 border ${
                    errors.email ? "border-rose-500/80 focus:ring-rose-500/30" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                  } rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-rose-400 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full bg-slate-900/90 border ${
                    errors.password ? "border-rose-500/80 focus:ring-rose-500/30" : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                  } rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-rose-400 mt-1 flex items-center gap-1">
                  <span>•</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign in to Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}