import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/Modal";
import type { FreezeValues } from "./types";

const schema = z.object({
  freezeFrom: z.string().min(1, "Required"),
  freezeTo: z.string().min(1, "Required"),
  reason: z.string().min(2, "Reason is required").max(500),
});
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FreezeValues) => Promise<void>;
}

export default function FreezeMembershipModal({ open, onClose, onSubmit }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { freezeFrom: today, freezeTo: today, reason: "" },
  });

  return (
    <Modal open={open} title="Freeze Membership" onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" form="freeze-form" disabled={isSubmitting}
            className="px-3 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? "Freezing…" : "Freeze"}
          </button>
        </>
      }
    >
      <form id="freeze-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Freeze From *</label>
            <input type="date" {...register("freezeFrom")}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            {errors.freezeFrom && <p className="text-xs text-red-600 mt-1">{errors.freezeFrom.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Freeze To *</label>
            <input type="date" {...register("freezeTo")}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            {errors.freezeTo && <p className="text-xs text-red-600 mt-1">{errors.freezeTo.message}</p>}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Reason *</label>
          <textarea rows={3} {...register("reason")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason.message}</p>}
        </div>
      </form>
    </Modal>
  );
}