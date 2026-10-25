import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search, ArrowLeft, User as UserIcon, ChevronRight,
  RefreshCw, Plus, AlertCircle, CheckCircle2, Loader2, Calendar,
} from "lucide-react";
import Modal from "../../components/Modal";
import { listMembers } from "../members/api";
import { listMemberships, renewMembership } from "../memberships/api";
import type { Member } from "../members/types";
import type { CreatePaymentValues } from "./types";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER"]),
  reference: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
}).refine(
  (v) => v.method === "CASH" || (v.reference && v.reference.trim().length > 0),
  { message: "Transaction reference (UTR) is required for UPI/Bank Transfer.", path: ["reference"] }
);
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreatePaymentValues) => Promise<void>;
}

function money(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function CreatePaymentModal({ open, onClose, onSubmit }: Props) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const form = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, method: "CASH", reference: "", notes: "" },
  });

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedMember(null);
      setSearch("");
      setDebouncedSearch("");
      setRenewError(null);
      setRenewing(false);
      form.reset({ amount: 0, method: "CASH", reference: "", notes: "" });
    }
  }, [open, form]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Members search
  const { data: membersData, isFetching: searchingMembers } = useQuery({
    queryKey: ["member-search-pay", debouncedSearch],
    queryFn: () => listMembers({ search: debouncedSearch, pageSize: 30 }),
    enabled: open && !selectedMember && debouncedSearch.length >= 1,
    placeholderData: { items: [], total: 0 },
  });

  // Memberships for selected member
  const {
    data: memberships = [],
    isLoading: loadingMemberships,
    refetch: refetchMemberships,
  } = useQuery({
    queryKey: ["member-memberships-pay", selectedMember?.id],
    queryFn: () => listMemberships(undefined, selectedMember!.id),
    enabled: !!selectedMember,
  });

  const activeMembership = useMemo(
    () => memberships.find((m) => m.status === "ACTIVE"),
    [memberships]
  );
  const expiredMembership = useMemo(
    () => memberships.find((m) => m.status === "EXPIRED"),
    [memberships]
  );

  const method = form.watch("method");
  const amount = form.watch("amount");
  const { formState: { errors, isSubmitting } } = form;

  // Prefill amount
  useEffect(() => {
    if (activeMembership && activeMembership.balanceDue > 0) {
      form.setValue("amount", activeMembership.balanceDue);
    }
  }, [activeMembership, form]);

  // Handlers
  function pickMember(m: Member) {
    setSelectedMember(m);
    setSearch("");
    setDebouncedSearch("");
    setRenewError(null);
  }

  function goBack() {
    setSelectedMember(null);
    setRenewError(null);
    form.reset({ amount: 0, method: "CASH", reference: "", notes: "" });
  }

  async function renewTarget(id: string) {
    setRenewing(true);
    setRenewError(null);
    try {
      await renewMembership(id);
      qc.invalidateQueries({ queryKey: ["memberships"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await refetchMemberships();
    } catch (e: any) {
      setRenewError(e?.response?.data?.detail ?? "Failed to renew membership.");
    } finally {
      setRenewing(false);
    }
  }

  async function submit(v: Values) {
    if (!activeMembership) return;
    await onSubmit({
      membershipId: activeMembership.id,
      amount: v.amount,
      method: v.method,
      reference: v.reference || undefined,
      notes: v.notes || undefined,
    });
  }

  const balanceAfter = activeMembership
    ? Math.max(0, activeMembership.balanceDue - (Number(amount) || 0))
    : 0;
  const overLimit = !!activeMembership && Number(amount) > activeMembership.balanceDue;

  const memberResults = membersData?.items ?? [];

  // Decide step 2 state
  let step2State: "loading" | "pay-active" | "active-paid" | "expired" | "none" = "loading";
  if (!loadingMemberships) {
    if (activeMembership) {
      step2State = activeMembership.balanceDue > 0 ? "pay-active" : "active-paid";
    } else if (expiredMembership) {
      step2State = "expired";
    } else {
      step2State = "none";
    }
  }

  const canSubmit = step2State === "pay-active" && !overLimit;

  return (
    <Modal
      open={open}
      title={selectedMember ? "Record Payment" : "Find Member"}
      onClose={onClose}
      size="lg"
      footer={
        canSubmit ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="pay-form"
              disabled={isSubmitting}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50"
            >
              {isSubmitting ? "Recording…" : "Record Payment"}
            </button>
          </>
        ) : undefined
      }
    >
      {!selectedMember ? (
        /* ============ STEP 1 — SEARCH ============ */
        <div className="space-y-4">
          <p className="text-slate-600">
            Search by member code, name, or mobile number.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. MQG-B01-000267, John Doe, 9876543210"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {searchingMembers && (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </div>
          )}

          {!searchingMembers && debouncedSearch.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              <UserIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">Start typing to find a member</p>
              <p className="text-slate-400 mt-1">Search by code, name or mobile</p>
            </div>
          )}

          {!searchingMembers && debouncedSearch.length >= 1 && memberResults.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold">No members found</p>
              <p className="text-slate-400 mt-1">Try a different search term</p>
            </div>
          )}

          {!searchingMembers && memberResults.length > 0 && (
            <div className="border border-slate-200 rounded-lg max-h-96 overflow-y-auto divide-y divide-slate-100">
              {memberResults.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pickMember(m)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {m.photoBase64 ? (
                      <img
                        src={`data:${m.photoContentType ?? "image/jpeg"};base64,${m.photoBase64}`}
                        alt={m.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{m.fullName}</p>
                    <p className="text-slate-500 font-mono">
                      {m.memberCode} · {m.mobile}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ============ STEP 2 — BILLING ============ */
        <div className="space-y-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Change Member
          </button>

          {/* Member card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {selectedMember.photoBase64 ? (
                <img
                  src={`data:${selectedMember.photoContentType ?? "image/jpeg"};base64,${selectedMember.photoBase64}`}
                  alt={selectedMember.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 truncate">{selectedMember.fullName}</p>
              <p className="text-slate-500 font-mono">
                {selectedMember.memberCode} · {selectedMember.mobile}
              </p>
            </div>
          </div>

          {step2State === "loading" && (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading membership…
            </div>
          )}

          {step2State === "none" && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> No membership on file
                </p>
                <p className="text-amber-800 mt-1">
                  This member has no membership yet. Create one to start accepting payments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/memberships");
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold"
              >
                <Plus className="w-4 h-4" /> Go to Memberships page to create
              </button>
            </div>
          )}

          {step2State === "active-paid" && activeMembership && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Fully paid
                </p>
                <p className="text-emerald-800">
                  This membership has no outstanding balance.
                </p>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <Calendar className="w-4 h-4" /> {activeMembership.planName} · Ends {activeMembership.endDate}
                </div>
              </div>
              {renewError && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800">
                  {renewError}
                </div>
              )}
              <button
                type="button"
                onClick={() => renewTarget(activeMembership.id)}
                disabled={renewing}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold disabled:opacity-50"
              >
                {renewing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Renewing…
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Renew Membership & Add Payment
                  </>
                )}
              </button>
            </div>
          )}

          {step2State === "expired" && expiredMembership && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Membership expired
                </p>
                <div className="flex items-center gap-1.5 text-amber-800">
                  <Calendar className="w-4 h-4" /> {expiredMembership.planName} · Expired {expiredMembership.endDate}
                </div>
                <p className="text-amber-800">
                  Renew the membership to continue accepting payments.
                </p>
              </div>
              {renewError && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800">
                  {renewError}
                </div>
              )}
              <button
                type="button"
                onClick={() => renewTarget(expiredMembership.id)}
                disabled={renewing}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold disabled:opacity-50"
              >
                {renewing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Renewing…
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Renew Membership & Add Payment
                  </>
                )}
              </button>
            </div>
          )}

          {step2State === "pay-active" && activeMembership && (
            <form id="pay-form" onSubmit={form.handleSubmit(submit)} className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2">
                <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Active Membership
                </p>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Plan</span>
                  <span className="font-bold text-indigo-900">{activeMembership.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Period</span>
                  <span className="font-bold text-indigo-900">
                    {activeMembership.startDate} → {activeMembership.endDate}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-indigo-200">
                  <span className="text-indigo-700">Membership Total</span>
                  <span className="font-bold text-indigo-900">{money(activeMembership.totalPayable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Already Paid</span>
                  <span className="font-bold text-indigo-900">{money(activeMembership.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-rose-700">Balance Due</span>
                  <span className="font-extrabold text-rose-700">
                    {money(activeMembership.balanceDue)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...form.register("amount")}
                    className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.amount && <p className="text-rose-600 mt-1">{errors.amount.message}</p>}
                  {overLimit && (
                    <p className="text-rose-600 mt-1">
                      Cannot exceed {money(activeMembership.balanceDue)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-slate-700">Method *</label>
                  <select
                    {...form.register("method")}
                    className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {method !== "CASH" && (
                <div>
                  <label className="font-bold text-slate-700">
                    Transaction Reference / UTR *
                  </label>
                  <input
                    {...form.register("reference")}
                    placeholder={method === "UPI" ? "e.g. 123456789012" : "e.g. NEFT reference"}
                    className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.reference && (
                    <p className="text-rose-600 mt-1">{errors.reference.message}</p>
                  )}
                </div>
              )}

              {Number(amount) > 0 && !overLimit && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex justify-between text-emerald-900">
                    <span>After this payment</span>
                    <span className="font-extrabold">{money(balanceAfter)} balance</span>
                  </div>
                  <p className="text-emerald-700 mt-1">
                    {balanceAfter === 0
                      ? "This will fully pay the membership."
                      : "Remaining balance will carry forward."}
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700">Notes</label>
                <textarea
                  {...form.register("notes")}
                  rows={2}
                  className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}

