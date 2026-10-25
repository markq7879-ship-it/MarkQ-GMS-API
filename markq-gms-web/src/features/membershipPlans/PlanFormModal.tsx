import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/Modal";
import type { MembershipPlan, MembershipPlanFormValues } from "./types";

const schema = z.object({
  name: z.string().min(2).max(200),
  durationDays: z.coerce.number().int().min(1).max(3650),
  basePrice: z.coerce.number().min(0),
  registrationFee: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  gstPercent: z.coerce.number().min(0).max(100),
  gstIncluded: z.boolean(),
  freezeEligible: z.boolean(),
  maxFreezeDays: z.coerce.number().int().min(0).max(365),
});
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  plan?: MembershipPlan | null;
  onClose: () => void;
  onSubmit: (values: MembershipPlanFormValues) => Promise<void>;
}

export default function PlanFormModal({ open, plan, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", durationDays: 30, basePrice: 0, registrationFee: 0, discount: 0,
      gstPercent: 0, gstIncluded: false, freezeEligible: false, maxFreezeDays: 0,
    },
  });

  useEffect(() => {
    if (plan) reset(plan as Values);
    else reset({
      name: "", durationDays: 30, basePrice: 0, registrationFee: 0, discount: 0,
      gstPercent: 0, gstIncluded: false, freezeEligible: false, maxFreezeDays: 0,
    });
  }, [plan, reset]);

  return (
    <Modal open={open} title={plan ? "Edit Membership Plan" : "Add Membership Plan"}
      onClose={onClose} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" form="plan-form" disabled={isSubmitting}
            className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? "Savingâ€¦" : plan ? "Update" : "Create"}
          </button>
        </>
      }
    >
      <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Plan Name *</label>
          <input {...register("name")} placeholder="e.g. Monthly Gold"
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Duration (days) *</label>
          <input type="number" {...register("durationDays")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Base Price *</label>
          <input type="number" step="0.01" {...register("basePrice")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Registration Fee</label>
          <input type="number" step="0.01" {...register("registrationFee")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Discount</label>
          <input type="number" step="0.01" {...register("discount")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">GST %</label>
          <input type="number" step="0.01" {...register("gstPercent")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="gstIncluded" {...register("gstIncluded")}
            className="w-4 h-4 rounded border-slate-300" />
          <label htmlFor="gstIncluded" className="text-sm text-slate-700">GST included in price</label>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="freezeEligible" {...register("freezeEligible")}
            className="w-4 h-4 rounded border-slate-300" />
          <label htmlFor="freezeEligible" className="text-sm text-slate-700">Freeze eligible</label>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Max Freeze Days</label>
          <input type="number" {...register("maxFreezeDays")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </form>
    </Modal>
  );
}
