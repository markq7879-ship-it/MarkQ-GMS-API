import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, UserCheck } from "lucide-react";
import Modal from "../../components/Modal";
import { listMembers } from "../members/api";
import { listPlans } from "../membershipPlans/api";
import { useAuthStore } from "../auth/authStore";
import { useQuery } from "@tanstack/react-query";
import type { CreateMembershipValues } from "./types";

const todayStr = new Date().toISOString().slice(0, 10);

const schema = z.object({
  memberId: z.string().uuid("Select a member"),
  planId: z.string().uuid("Select a plan"),
  startDate: z.string().min(1, "Start date is required"),
  endDateOverride: z.string().optional().or(z.literal("")),
  endDateOverrideReason: z.string().max(500).optional().or(z.literal("")),
  registrationFeeOverride: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  discountOverride: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  discountReason: z.string().max(500).optional().or(z.literal("")),
  paymentDueDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateMembershipValues) => Promise<void>;
}

export default function CreateMembershipModal({ open, onClose, onSubmit }: Props) {
  const isOwner = useAuthStore((s) => s.user?.role === "OWNER");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<{ id: string; label: string } | null>(null);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: {
        memberId: "", planId: "", startDate: todayStr,
        endDateOverride: "", endDateOverrideReason: "",
        registrationFeeOverride: "", discountOverride: "", discountReason: "",
        paymentDueDate: "", notes: "",
      },
    });

  // Load members (up to 500, filter client-side)
  const { data: membersData } = useQuery({
    queryKey: ["members-for-membership"],
    queryFn: () => listMembers({ pageSize: 500 }),
    enabled: open,
    placeholderData: { items: [], total: 0 },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans-for-membership"],
    queryFn: () => listPlans(),
    enabled: open,
  });

  const allMembers = membersData?.items ?? [];
  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return allMembers.slice(0, 50);
    return allMembers.filter((m) =>
      m.fullName.toLowerCase().includes(q) ||
      m.mobile.includes(q) ||
      m.memberCode.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [allMembers, memberSearch]);

  const planId = watch("planId");
  const startDate = watch("startDate");
  const regFeeOverride = watch("registrationFeeOverride");
  const discountOverride = watch("discountOverride");
  const endDateOverride = watch("endDateOverride");

  const selectedPlan = plans.find((p) => p.id === planId);

  // Auto-calculated end date preview
  const calculatedEndDate = useMemo(() => {
    if (!selectedPlan || !startDate) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + selectedPlan.durationDays);
    return end.toISOString().slice(0, 10);
  }, [selectedPlan, startDate]);

  const effectiveEndDate = endDateOverride || calculatedEndDate;

  // Pricing preview
  const regFee = regFeeOverride !== "" && regFeeOverride !== undefined
    ? Number(regFeeOverride) : (selectedPlan?.registrationFee ?? 0);
  const discount = discountOverride !== "" && discountOverride !== undefined
    ? Number(discountOverride) : (selectedPlan?.discount ?? 0);

  const pricing = useMemo(() => {
    if (!selectedPlan) return { subtotal: 0, gstAmount: 0, total: 0 };
    const pre = Math.max(0, selectedPlan.basePrice + regFee - discount);
    if (selectedPlan.gstPercent <= 0) return { subtotal: pre, gstAmount: 0, total: pre };
    if (selectedPlan.gstIncluded) {
      const gst = Math.round((pre - pre / (1 + selectedPlan.gstPercent / 100)) * 100) / 100;
      return { subtotal: pre - gst, gstAmount: gst, total: pre };
    }
    const gst = Math.round(pre * (selectedPlan.gstPercent / 100) * 100) / 100;
    return { subtotal: pre, gstAmount: gst, total: pre + gst };
  }, [selectedPlan, regFee, discount]);

  // Reset on open
  useEffect(() => {
    if (open) {
      reset({
        memberId: "", planId: "", startDate: todayStr,
        endDateOverride: "", endDateOverrideReason: "",
        registrationFeeOverride: "", discountOverride: "", discountReason: "",
        paymentDueDate: "", notes: "",
      });
      setSelectedMember(null);
      setMemberSearch("");
    }
  }, [open, reset]);

  async function handleFormSubmit(v: Values) {
    await onSubmit({
      memberId: v.memberId,
      planId: v.planId,
      startDate: v.startDate,
      endDateOverride: v.endDateOverride || undefined,
      endDateOverrideReason: v.endDateOverrideReason || undefined,
      registrationFeeOverride: v.registrationFeeOverride === "" ? undefined : Number(v.registrationFeeOverride),
      discountOverride: v.discountOverride === "" ? undefined : Number(v.discountOverride),
      discountReason: v.discountReason || undefined,
      paymentDueDate: v.paymentDueDate || undefined,
      notes: v.notes || undefined,
    });
  }

  function selectMember(m: { id: string; fullName: string; memberCode: string; mobile: string }) {
    setSelectedMember({ id: m.id, label: `${m.memberCode} · ${m.fullName} · ${m.mobile}` });
    setValue("memberId", m.id, { shouldValidate: true });
    setMemberSearch("");
  }

  return (
    <Modal open={open} title="New Membership" onClose={onClose} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" form="memb-form" disabled={isSubmitting}
            className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? "Creating…" : "Create Membership"}
          </button>
        </>
      }
    >
      <form id="memb-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Member Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700">Member *</label>
          {selectedMember ? (
            <div className="mt-1 flex items-center justify-between border border-emerald-300 bg-emerald-50 rounded-md px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-emerald-900">
                <UserCheck className="w-4 h-4" />
                <span className="font-medium">{selectedMember.label}</span>
              </div>
              <button type="button"
                onClick={() => { setSelectedMember(null); setValue("memberId", ""); }}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline">
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search by name, mobile, or member code…"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <p className="p-3 text-sm text-slate-500 text-center">No members found</p>
                ) : (
                  filteredMembers.map((m) => (
                    <button type="button" key={m.id} onClick={() => selectMember(m)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50">
                      <div className="text-sm font-medium text-slate-800">{m.fullName}</div>
                      <div className="text-xs text-slate-500">{m.memberCode} · {m.mobile}</div>
                    </button>
                  ))
                )}
              </div>
              {errors.memberId && <p className="text-xs text-red-600 mt-1">{errors.memberId.message}</p>}
            </>
          )}
        </div>

        {/* Plan Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700">Plan *</label>
          <select {...register("planId")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select plan</option>
            {plans.filter((p) => p.isActive).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.durationDays} days · ₹{p.basePrice}
              </option>
            ))}
          </select>
          {errors.planId && <p className="text-xs text-red-600 mt-1">{errors.planId.message}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Start Date *</label>
            <input type="date" {...register("startDate")}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              End Date {calculatedEndDate && <span className="text-xs text-slate-400">(auto)</span>}
            </label>
            {isOwner ? (
              <input type="date" {...register("endDateOverride")}
                placeholder={calculatedEndDate}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            ) : (
              <input type="date" value={effectiveEndDate} readOnly disabled
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-600" />
            )}
            {isOwner && endDateOverride && (
              <input {...register("endDateOverrideReason")} placeholder="Reason for override…"
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            )}
          </div>
        </div>

        {/* Pricing */}
        {selectedPlan && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Pricing</h3>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Base Price</span>
              <span className="font-medium text-slate-900">₹{selectedPlan.basePrice.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Registration Fee</span>
              {isOwner ? (
                <input type="number" step="0.01" min="0"
                  {...register("registrationFeeOverride")}
                  placeholder={String(selectedPlan.registrationFee)}
                  className="w-32 text-right border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ) : (
                <span className="font-medium text-slate-900">₹{selectedPlan.registrationFee.toFixed(2)}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              {isOwner ? (
                <input type="number" step="0.01" min="0"
                  {...register("discountOverride")}
                  placeholder={String(selectedPlan.discount)}
                  className="w-32 text-right border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ) : (
                <span className="font-medium text-slate-900">₹{selectedPlan.discount.toFixed(2)}</span>
              )}
            </div>

            {isOwner && (discountOverride !== "" && discountOverride !== undefined) && (
              <div>
                <input {...register("discountReason")} placeholder="Discount reason…"
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}

            {selectedPlan.gstPercent > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  GST ({selectedPlan.gstPercent}%{selectedPlan.gstIncluded ? " included" : ""})
                </span>
                <span className="font-medium text-slate-900">₹{pricing.gstAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-300 text-base">
              <span className="font-semibold text-slate-900">Total Payable</span>
              <span className="font-bold text-indigo-600">₹{pricing.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Payment Due + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Payment Due Date</label>
            <input type="date" {...register("paymentDueDate")}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <p className="text-xs text-slate-500 mt-1">If the member pays in installments.</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Notes</label>
          <textarea {...register("notes")} rows={2}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </form>
    </Modal>
  );
}

