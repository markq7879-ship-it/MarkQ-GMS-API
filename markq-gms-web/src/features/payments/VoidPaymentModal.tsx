import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/Modal";
import type { VoidPaymentValues } from "./types";

const schema = z.object({ reason: z.string().min(3, "Reason is required").max(500) });
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: VoidPaymentValues) => Promise<void>;
}

export default function VoidPaymentModal({ open, onClose, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });

  return (
    <Modal open={open} title="Void Payment" onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" form="void-form" disabled={isSubmitting}
            className="px-3 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? "Voiding…" : "Void Payment"}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600 mb-3">
        Payments are never deleted. Voiding marks this payment as VOIDED and keeps the audit trail.
      </p>
      <form id="void-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="text-sm font-medium text-slate-700">Reason *</label>
        <textarea rows={3} {...register("reason")}
          className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason.message}</p>}
      </form>
    </Modal>
  );
}
