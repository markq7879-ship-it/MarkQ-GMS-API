import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Building2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import TableSkeleton from "../../components/TableSkeleton";
import BranchModal from "./BranchModal";
import { createBranch, listBranches, setBranchStatus, updateBranch } from "./api";
import type { Branch } from "./types";

export default function BranchesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches", search],
    queryFn: () => listBranches(search || undefined),
  });

  const createMut = useMutation({
    mutationFn: (name: string) => createBranch(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches"] }); close(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateBranch(id, name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches"] }); close(); },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setBranchStatus(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(b: Branch) { setEditing(b); setModalOpen(true); }
  function close() { setModalOpen(false); setEditing(null); }

  async function handleSubmit(values: { name: string }) {
    if (editing) await updateMut.mutateAsync({ id: editing.id, name: values.name });
    else await createMut.mutateAsync(values.name);
  }

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle="Manage gym branches. Branch codes are generated automatically."
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
            <Plus className="w-4 h-4" /> Add Branch
          </button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {isLoading ? <TableSkeleton /> : branches.length === 0 ? (
          <EmptyState icon={Building2} title="No branches yet"
            description="Click 'Add Branch' to create your first gym branch." />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-mono text-slate-700">{b.code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{b.name}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => statusMut.mutate({ id: b.id, active: !b.isActive })}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                        b.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>
                      {b.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(b)}
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

      <BranchModal open={modalOpen} branch={editing} onClose={close} onSubmit={handleSubmit} />
    </div>
  );
}