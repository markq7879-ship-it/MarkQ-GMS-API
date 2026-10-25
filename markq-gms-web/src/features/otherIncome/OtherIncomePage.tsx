import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, TrendingUp } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import TableSkeleton from "../../components/TableSkeleton";
import { listBranches } from "../branches/api";
import { createOtherIncome, listOtherIncome, updateOtherIncome } from "./api";
import OtherIncomeFormModal from "./OtherIncomeFormModal";
import type { OtherIncome, OtherIncomeFormValues } from "./types";

export default function OtherIncomePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OtherIncome | null>(null);

  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => listBranches() });
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["other-income", search],
    queryFn: () => listOtherIncome(search || undefined),
  });

  const createMut = useMutation({
    mutationFn: (v: OtherIncomeFormValues) => createOtherIncome(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["other-income"] }); close(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, v }: { id: string; v: OtherIncomeFormValues }) => updateOtherIncome(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["other-income"] }); close(); },
  });

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(e: OtherIncome) { setEditing(e); setModalOpen(true); }
  function close() { setModalOpen(false); setEditing(null); }

  async function handleSubmit(v: OtherIncomeFormValues) {
    if (editing) await updateMut.mutateAsync({ id: editing.id, v });
    else await createMut.mutateAsync(v);
  }

  return (
    <div>
      <PageHeader title="Other Income" subtitle="Non-membership income such as personal training and services."
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
            <Plus className="w-4 h-4" /> Add Income
          </button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md" />
          </div>
        </div>

        {isLoading ? <TableSkeleton /> : items.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No other income recorded"
            description="Record income from PT, supplements, or services. Requires the Other Income backend module." />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">{e.incomeDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{e.branchName}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{e.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{e.description ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-emerald-700">₹{e.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{e.method}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(e)}
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

      <OtherIncomeFormModal open={modalOpen} item={editing} branches={branches}
        onClose={close} onSubmit={handleSubmit} />
    </div>
  );
}