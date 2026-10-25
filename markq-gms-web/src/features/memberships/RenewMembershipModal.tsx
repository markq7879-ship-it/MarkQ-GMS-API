import { useQuery } from "@tanstack/react-query";
import { RefreshCw, X, AlertCircle, Calendar, Loader2 } from "lucide-react";
import { listPlans } from "../membershipPlans/api";
import type { Membership } from "./types";

interface Props {
  open: boolean;
  membership: Membership | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

function money(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function RenewMembershipModal({
  open, membership, onClose, onConfirm, isSubmitting, error,
}: Props) {
  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => listPlans(),
    enabled: open,
  });

  if (!open || !membership) return null;

  const plan = plans.find((p) => p.id === membership.planId);
  const durationDays = plan?.durationDays ?? 30;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(membership.endDate);
  endDate.setHours(0, 0, 0, 0);

  const baseFrom = endDate >= today ? endDate : today;
  const newEnd = new Date(baseFrom);
  newEnd.setDate(newEnd.getDate() + durationDays);

  const renewalAmount =
    membership.basePrice + membership.registrationFee - membership.discount;
  const newTotal = membership.totalPayable + renewalAmount;
  const newBalance = membership.balanceDue + renewalAmount;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="font-extrabold text-slate-800 text-lg">Renew Membership?</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Member */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">
              Member
            </p>
            <p className="font-bold text-slate-800 mt-0.5">
              {membership.memberName}
            </p>
            <p className="font-mono text-slate-500">
              {membership.memberCode} · {membership.membershipNumber}
            </p>
          </div>

          {/* Dates */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900">
              <Calendar className="w-4 h-4" />
              <span className="font-bold">{membership.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700 font-semibold">Current End</span>
              <span className="font-bold text-indigo-900">{fmtDate(membership.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700 font-semibold">New End</span>
              <span className="font-bold text-emerald-700">
                {newEnd.toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}{" "}
                <span className="text-indigo-600 font-semibold">
                  (+{durationDays} days)
                </span>
              </span>
            </div>
          </div>

          {/* Amounts */}
          <div className="border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Current Total</span>
              <span className="font-bold text-slate-800">{money(membership.totalPayable)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Renewal Amount</span>
              <span className="font-bold text-amber-700">+ {money(renewalAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-800">New Total Payable</span>
              <span className="font-extrabold text-indigo-700 text-base">{money(newTotal)}</span>
            </div>
            {membership.balanceDue > 0 && (
              <div className="flex justify-between pt-1">
                <span className="text-slate-600">Current Balance Due</span>
                <span className="font-bold text-rose-700">{money(membership.balanceDue)}</span>
              </div>
            )}
            {membership.balanceDue > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">New Balance After Renewal</span>
                <span className="font-bold text-rose-700">{money(newBalance)}</span>
              </div>
            )}
          </div>

          <p className="text-slate-500 leading-relaxed">
            This action will extend the membership by <b>{durationDays} days</b>. The renewal
            amount of <b>{money(renewalAmount)}</b> will be added to the outstanding balance.
            This action cannot be undone from the UI — use Freeze or Cancel if entered incorrectly.
          </p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-rose-800 text-sm font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-300 rounded-md hover:bg-white font-bold disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Renewing…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Confirm Renew
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
