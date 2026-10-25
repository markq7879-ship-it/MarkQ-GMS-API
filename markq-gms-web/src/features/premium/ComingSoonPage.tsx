import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Bell, CheckCircle2, Sparkles, Clock, ArrowRight,
} from "lucide-react";
import { getPremiumFeature } from "../../config/premiumFeatures";

export default function ComingSoonPage() {
  const { slug } = useParams<{ slug: string }>();
  const feature = slug ? getPremiumFeature(slug) : undefined;

  if (!feature) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500 text-lg font-bold">Feature not found</p>
        <Link to="/" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const Icon = feature.icon;
  const isSoon = feature.tier === "SOON";
  const badgeBg = isSoon
    ? "bg-purple-100 text-purple-700 border-purple-300"
    : "bg-amber-100 text-amber-800 border-amber-300";
  const gradient = isSoon
    ? "from-purple-600 via-indigo-700 to-purple-800"
    : "from-indigo-600 via-indigo-700 to-indigo-900";
  const accent = isSoon ? "text-purple-600" : "text-indigo-600";
  const accentBg = isSoon ? "bg-purple-50" : "bg-indigo-50";
  const accentBorder = isSoon ? "border-purple-200" : "border-indigo-200";

  return (
    <div className="space-y-6 pb-8 max-w-4xl">

      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-bold transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-white p-8 shadow-xl`}>
        <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-16 bottom-0 translate-y-24 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-white/20 text-white border-white/30 mb-2`}>
                {isSoon ? <Clock className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                {isSoon ? "Coming Soon" : "Pro Feature"}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
                {feature.title}
              </h1>
              <p className="text-sm text-white/80 mt-2 max-w-xl">
                {feature.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Release + CTA row */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border ${accentBorder} ${accentBg} p-5`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-white border ${accentBorder} flex items-center justify-center`}>
            <Clock className={`w-5 h-5 ${accent}`} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Planned Release
            </p>
            <p className={`text-lg font-extrabold ${accent}`}>{feature.release}</p>
          </div>
        </div>
        <button
          onClick={() => alert(`We'll notify you when ${feature.title} is ready. This demo doesn't send emails yet — contact support to be added to the waitlist.`)}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-bold text-white shadow-lg transition active:scale-95 ${
            isSoon
              ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/30"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30"
          }`}
        >
          <Bell className="w-4 h-4" /> Notify Me When Ready
        </button>
      </div>

      {/* What's coming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accent}`} />
            What's coming
          </h2>
          <ul className="space-y-3">
            {feature.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className={`w-5 h-5 ${accent} shrink-0 mt-0.5`} />
                <span className="text-sm text-slate-700 font-semibold leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-3">
            Why this matters
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {feature.why}
          </p>
        </div>
      </div>

      {/* Footer note */}
      <div className={`rounded-xl border ${accentBorder} bg-white p-4 text-center`}>
        <p className="text-sm text-slate-600">
          <span className="font-bold text-slate-800">Want this feature faster?</span>{" "}
          Contact us to discuss priority implementation for your gym.
        </p>
        <Link
          to="/"
          className={`inline-flex items-center gap-1.5 mt-3 font-bold ${accent} hover:underline`}
        >
          Continue using Mark-Q GMS <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
