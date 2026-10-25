import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/Modal";
import type { Branch } from "../branches/types";
import type { OtherIncome, OtherIncomeFormValues } from "./types";

const schema = z.object({
  branchId: z.string().uuid("Select a branch"),
  category: z.enum(["PERSONAL_TRAINING","SUPPLEMENTS","MERCHANDISE","SERVICE","OTHER"]),
  amount: z.coerce.number().positive("Amount must be > 0"),
  incomeDate: z.string().min(1, "Date is required"),
  method: z.enum(["CASH","UPI","BANK_TRANSFER"]),
  description: z.string().max(500).optional().or(z.literal("")),
});
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  item?: OtherIncome | null;
  branches: Branch[];
  onClose: () => void;
  onSubmit: (values: OtherIncomeFormValues) => Promise<void>;
}

export default function OtherIncomeFormModal({ open, item, branches, onClose, onSubmit }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      branchId: "", category: "OTHER", amount: 0,
      incomeDate: today, method: "CASH", description: "",
    },
  });

  useEffect(() => {
    reset({
      branchId: item?.branchId ?? branches[0]?.id ?? "",
      category: item?.category ?? "OTHER",
      amount: item?.amount ?? 0,
      incomeDate: item?.incomeDate ?? today,
      method: item?.method ?? "CASH",
      description: item?.description ?? "",
    });
  }, [item, branches, today, reset]);

  return (
    <Modal open={open} title={item ? "Edit Other Income" : "Add Other Income"} onClose={onClose} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" form="oi-form" disabled={isSubmitting}
            className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? "Savingâ€¦" : item ? "Update" : "Create"}
          </button>
        </>
      }
    >
      <form id="oi-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Branch *</label>
          <select {...register("branchId")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
            <option value="">Select branch</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.code} Â· {b.name}</option>)}
          </select>
          {errors.branchId && <p className="text-xs text-red-600 mt-1">{errors.branchId.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Category *</label>
          <select {...register("category")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
            <option value="PERSONAL_TRAINING">Personal Training</option>
            <option value="SUPPLEMENTS">Supplements</option>
            <option value="MERCHANDISE">Merchandise</option>
            <option value="SERVICE">Service</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Amount *</label>
          <input type="number" step="0.01" {...register("amount")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Date *</label>
          <input type="date" {...register("incomeDate")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Payment Method *</label>
          <select {...register("method")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea rows={2} {...register("description")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        </div>
      </form>
    </Modal>
  );
}
