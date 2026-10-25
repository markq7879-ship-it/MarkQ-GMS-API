
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, UserCog } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import TableSkeleton from "../../components/TableSkeleton";
import { listBranches } from "../branches/api";
import { assignBranches, createUser, listUsers, setUserStatus, updateUser } from "./api";
import UserFormModal from "./UserFormModal";
import type { UserSummary } from "./types";

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserSummary | null>(null);

  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => listBranches() });
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: () => listUsers(search || undefined),
  });

  const createMut = useMutation({
    mutationFn: async (v: Parameters<typeof createUser>[0]) => {
      const created = await createUser(v);
      if (v.role === "ADMIN" && v.branchIds.length > 0) {
        await assignBranches(created.id, v.branchIds);
      }
      return created;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); close(); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, v }: { id: string; v: Parameters<typeof updateUser>[1]; branchIds?: string[] }) => {
      const updated = await updateUser(id, v);
      if (v.role === "ADMIN" && v.branchIds !== undefined) {
        await assignBranches(id, v.branchIds);
      }
      return updated;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); close(); },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setUserStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(u: UserSummary) { setEditing(u); setModalOpen(true); }
  function close() { setModalOpen(false); setEditing(null); }

  async function handleSubmit(v: Parameters<typeof createUser>[0]) {
    if (editing) {
      await updateMut.mutateAsync({
        id: editing.id,
        v: { fullName: v.fullName, phone: v.phone, role: v.role, branchIds: v.branchIds } as never,
        branchIds: v.branchIds,
      });
    } else {
      await createMut.mutateAsync(v);
    }
  }

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage owners and branch admins."
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
            <Plus className="w-4 h-4" /> Add User
          </button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md" />
          </div>
        </div>

        {isLoading ? <TableSkeleton /> : users.length === 0 ? (
          <EmptyState icon={UserCog} title="No users yet"
            description="Add admins who can operate branches. Requires the Users backend module." />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Branches</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{u.fullName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === "OWNER" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {u.role === "OWNER" ? "All" : (u.branchIds.length || "None")}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => statusMut.mutate({ id: u.id, isActive: !u.isActive })}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        u.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                   : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(u)}
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

      <UserFormModal open={modalOpen} user={editing} branches={branches}
        onClose={close} onSubmit={handleSubmit} />
    </div>
  );
}