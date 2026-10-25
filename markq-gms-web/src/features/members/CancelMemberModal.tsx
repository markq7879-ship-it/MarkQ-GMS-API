import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, AlertTriangle, UserX, Loader2 } from "lucide-react";
import type { Member } from "./types";

const schema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
});
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export default function CancelMemberModal({
  open, member, onClose, onConfirm, isSubmitting, error,
}: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });

  if (!open || !member) return null;

  async function submit(v: Values) {
    await onConfirm(v.reason);
    reset();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
              <UserX className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="font-extrabold text-slate-800 text-lg">Cancel Member?</h2>
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
        <form id="cancel-member-form" onSubmit={handleSubmit(submit)} className="p-5 space-y-4">

          {/* Member card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">
              Member
            </p>
            <p className="font-bold text-slate-800 mt-0.5">{member.fullName}</p>
            <p className="font-mono text-slate-500">
              {member.memberCode} · {member.mobile}
            </p>
          </div>

          {/* Warning box */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">This will also cancel their active memberships.</p>
              <p className="text-rose-800 text-sm mt-1">
                The member will be hidden from the main list and excluded from dashboard counts.
                Payment history and records are preserved. You can reactivate the member later,
                but their memberships will need to be renewed separately.
              </p>
            </div>
          </div>

          {/* Reason input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for cancellation *</label>
            <textarea
              {...register("reason")}
              rows={3}
              placeholder="e.g. Shifted to another city, financial reasons, medical leave…"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              disabled={isSubmitting}
            />
            {errors.reason && <p className="text-rose-600 text-sm mt-1">{errors.reason.message}</p>}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-rose-800 text-sm">
              {error}
            </div>
          )}
        </form>

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
            type="submit"
            form="cancel-member-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Cancelling…
              </>
            ) : (
              <>
                <UserX className="w-4 h-4" /> Confirm Cancellation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
