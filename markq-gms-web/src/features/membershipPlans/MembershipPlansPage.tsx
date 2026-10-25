import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, CreditCard } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import TableSkeleton from "../../components/TableSkeleton";
import PlanFormModal from "./PlanFormModal";
import { createPlan, listPlans, setPlanStatus, updatePlan } from "./api";
import type { MembershipPlan, MembershipPlanFormValues } from "./types";

export default function MembershipPlansPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans", search],
    queryFn: () => listPlans(search || undefined),
  });

  const createMut = useMutation({
    mutationFn: (v: MembershipPlanFormValues) => createPlan(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); close(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, v }: { id: string; v: MembershipPlanFormValues }) => updatePlan(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); close(); },
  });
  const statusMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setPlanStatus(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(p: MembershipPlan) { setEditing(p); setModalOpen(true); }
  function close() { setModalOpen(false); setEditing(null); }

  async function handleSubmit(v: MembershipPlanFormValues) {
    if (editing) await updateMut.mutateAsync({ id: editing.id, v });
    else await createMut.mutateAsync(v);
  }

  return (
    <div>
      <PageHeader title="Membership Plans" subtitle="Configure plans and pricing. GST and freeze rules are set per plan."
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {isLoading ? <TableSkeleton /> : plans.length === 0 ? (
          <EmptyState icon={CreditCard} title="No membership plans yet"
            description="Add your first plan. Requires the Membership Plans backend module." />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3 text-right">Base Price</th>
                <th className="px-4 py-3 text-right">GST %</th>
                <th className="px-4 py-3">Freeze</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.durationDays} days</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">₹{p.basePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">{p.gstPercent}%</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.freezeEligible ? `Up to ${p.maxFreezeDays}d` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => statusMut.mutate({ id: p.id, active: !p.isActive })}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                   : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PlanFormModal open={modalOpen} plan={editing} onClose={close} onSubmit={handleSubmit} />
    </div>
  );
}