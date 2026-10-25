import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Users as UsersIcon, Eye, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import TableSkeleton from "../../components/TableSkeleton";
import Pagination from "../../components/Pagination";
import { listBranches } from "../branches/api";
import { createMember, getMember, listMembers, updateMember } from "./api";
import MemberFormModal from "./MemberFormModal";
import type { Member, MemberFormValues } from "./types";

const FILTER_LABELS: Record<string, string> = {
  active: "Active Members",
  inactive: "Inactive Members",
  expiring7: "Expiring in 7 Days",
  expiringtoday: "Expiring Today",
  newtoday: "New Members Today",
  pending: "Members with Balance Due",
  cancelled: "Cancelled Members",
};

export default function MembersPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") ?? undefined;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => listBranches() });

  const { data, isLoading } = useQuery({
    queryKey: ["members", { search, page, filter }],
    queryFn: () => listMembers({ search: search || undefined, page, pageSize, filter }),
    placeholderData: { items: [], total: 0 },
  });

  const createMut = useMutation({
    mutationFn: (v: MemberFormValues) => createMember(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["members"] }); close(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, v }: { id: string; v: MemberFormValues }) => updateMember(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["members"] }); close(); },
  });

  function openCreate() { setEditing(null); setModalOpen(true); }

  async function openEdit(m: Member, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    try {
      const full = await getMember(m.id);
      setEditing(full);
      setModalOpen(true);
    } catch {
      setEditing(m);
      setModalOpen(true);
    }
  }

  function goToProfile(id: string) {
    navigate(`/members/${id}`);
  }

  function close() { setModalOpen(false); setEditing(null); }

  async function handleSubmit(v: MemberFormValues) {
    if (editing) await updateMut.mutateAsync({ id: editing.id, v });
    else await createMut.mutateAsync(v);
  }

  function clearFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete("filter");
    setSearchParams(next);
    setPage(1);
  }

  const members = data?.items ?? [];
  const total = data?.total ?? 0;
  const filterLabel = filter ? FILTER_LABELS[filter] ?? filter : null;

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
      FROZEN: "bg-amber-50 text-amber-700 border-amber-200",
      CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
      INACTIVE: "bg-slate-100 text-slate-500 border-slate-200",
      NO_MEMBERSHIP: "bg-slate-100 text-slate-500 border-slate-200",
    };
    const cls = map[status] ?? "bg-slate-100 text-slate-700 border-slate-200";
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-xs border ${cls}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={filterLabel ? `Showing: ${filterLabel}` : "Manage gym members. Click any row to view the full profile."}
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        }
      />

      {filterLabel && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full">
          <span className="font-bold">Filter: {filterLabel}</span>
          <span className="text-indigo-500">({total} results)</span>
          <button onClick={clearFilter} className="p-0.5 rounded-full hover:bg-indigo-100" title="Clear filter">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, mobile, member code…"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {isLoading ? <TableSkeleton /> : members.length === 0 ? (
          <EmptyState icon={UsersIcon}
            title={filterLabel ? `No ${filterLabel.toLowerCase()}` : "No members yet"}
            description={filterLabel ? "Try clearing the filter to see all members." : "Click 'Add Member' to register the first member."} />
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 w-16">Photo</th>
                  <th className="px-4 py-3">Member Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => goToProfile(m.id)}
                    className={`cursor-pointer transition-colors ${
                      m.status === "CANCELLED"
                        ? "bg-rose-50/30 hover:bg-rose-50/60"
                        : "hover:bg-indigo-50/50"
                    }`}
                    title="Click to view full profile"
                  >
                    <td className="px-4 py-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                        {m.photoBase64 ? (
                          <img src={`data:${m.photoContentType ?? "image/jpeg"};base64,${m.photoBase64}`}
                            alt={m.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <UsersIcon className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{m.memberCode}</td>
                    <td className={`px-4 py-3 font-semibold ${m.status === "CANCELLED" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {m.fullName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{m.mobile}</td>
                    <td className="px-4 py-3 text-slate-600">{m.branchName}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); goToProfile(m.id); }}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold mr-3"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button
                        onClick={(e) => openEdit(m, e)}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 font-bold"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={total} onPage={setPage} />
          </>
        )}
      </div>

      <MemberFormModal open={modalOpen} member={editing} branches={branches}
        onClose={close} onSubmit={handleSubmit} />
    </div>
  );
}
