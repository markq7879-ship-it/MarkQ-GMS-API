import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Pencil, MessageCircle, Printer, User as UserIcon,
  Phone, Mail, MapPin, Droplet, Heart, Calendar,
  Users as UsersIcon, AlertTriangle, CheckCircle2, XCircle, Clock,
  Package, FileBadge,
} from "lucide-react";
import { getMember, updateMember, cancelMember, reactivateMember } from "./api";
import { listMemberships } from "../memberships/api";
import { listPayments } from "../payments/api";
import { listBranches } from "../branches/api";
import { openMemberWhatsApp } from "../../lib/whatsapp";
import MemberFormModal from "./MemberFormModal";
import CancelMemberModal from "./CancelMemberModal";
import type { Member, MemberFormValues } from "./types";

function money(n: number | undefined | null) {
  if (n === undefined || n === null) return "—";
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return d;
  }
}

function escapeHtml(s: string): string {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] as string));
}

function printIdCard(member: Member, activeMembership: any) {
  const w = window.open("", "_blank", "width=760,height=900");
  if (!w) { alert("Popup blocked. Please allow popups for this site."); return; }

  const photoUrl = member.photoBase64
    ? `data:${member.photoContentType ?? "image/jpeg"};base64,${member.photoBase64}`
    : "";
  const validUntil = activeMembership?.endDate ?? "—";
  const initials = member.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  w.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>ID Card — ${escapeHtml(member.memberCode)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Calibri', Arial, sans-serif; padding: 30px; background: #e2e8f0;
    display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .card { width: 340px; height: 540px; background: linear-gradient(180deg, #0f172a 0%, #312e81 50%, #4c1d95 100%);
    border-radius: 16px; padding: 22px; color: white; display: flex; flex-direction: column;
    box-shadow: 0 20px 40px rgba(0,0,0,.3); position: relative; overflow: hidden; }
  .card::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px;
    background: rgba(255,255,255,.08); border-radius: 50%; }
  .header { text-align: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,.2); position: relative; z-index: 1; }
  .brand { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; }
  .sub { font-size: 8.5px; text-transform: uppercase; letter-spacing: .18em; color: rgba(255,255,255,.55); margin-top: 2px; font-weight: 700; }
  .photo-wrap { display: flex; justify-content: center; margin: 16px 0 14px; position: relative; z-index: 1; }
  .photo { width: 128px; height: 128px; border-radius: 50%; border: 3px solid rgba(255,255,255,.35);
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,.1); font-size: 32px; font-weight: 800; color: rgba(255,255,255,.7);
    box-shadow: 0 6px 16px rgba(0,0,0,.3); }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .name { font-size: 17px; font-weight: 800; text-align: center; line-height: 1.2; margin-bottom: 5px; position: relative; z-index: 1; }
  .code { font-family: 'Courier New', monospace; font-size: 12.5px; font-weight: 800; text-align: center; color: #a5b4fc; letter-spacing: .06em; margin-bottom: 14px; position: relative; z-index: 1; }
  .info { flex: 1; display: flex; flex-direction: column; gap: 6px; position: relative; z-index: 1; }
  .row { display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; padding: 6px 10px; background: rgba(255,255,255,.08); border-radius: 6px; }
  .row .lbl { color: rgba(255,255,255,.6); font-weight: 600; text-transform: uppercase; font-size: 8.5px; letter-spacing: .1em; }
  .row .val { font-weight: 700; color: white; }
  .footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.2); text-align: center; font-size: 8px; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .1em; font-weight: 700; position: relative; z-index: 1; }
  @media print { body { background: white; padding: 0; } .card { box-shadow: none; margin: 0 auto; } @page { margin: 15mm; } }
</style></head><body>
  <div class="card">
    <div class="header"><div class="brand">Mark-Q GMS</div><div class="sub">Gym Member Card</div></div>
    <div class="photo-wrap"><div class="photo">${photoUrl ? `<img src="${photoUrl}" alt="Photo" />` : initials}</div></div>
    <div class="name">${escapeHtml(member.fullName)}</div>
    <div class="code">${escapeHtml(member.memberCode)}</div>
    <div class="info">
      <div class="row"><span class="lbl">Branch</span><span class="val">${escapeHtml(member.branchName)}</span></div>
      <div class="row"><span class="lbl">Mobile</span><span class="val">${escapeHtml(member.mobile)}</span></div>
      ${member.bloodGroup ? `<div class="row"><span class="lbl">Blood Group</span><span class="val">${escapeHtml(member.bloodGroup)}</span></div>` : ""}
      <div class="row"><span class="lbl">Valid Until</span><span class="val">${escapeHtml(validUntil)}</span></div>
    </div>
    <div class="footer">If found, please return to the gym</div>
  </div>
</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!photoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhotoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photoOpen]);

  const { data: member, isLoading, isError } = useQuery({
    queryKey: ["member", id],
    queryFn: () => getMember(id!),
    enabled: !!id,
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ["member-memberships-profile", id],
    queryFn: () => listMemberships(undefined, id!),
    enabled: !!id,
  });

  const { data: allPayments = [] } = useQuery({
    queryKey: ["member-payments-profile", member?.memberCode],
    queryFn: () => listPayments(member!.memberCode),
    enabled: !!member?.memberCode,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => listBranches(),
  });

  const updateMut = useMutation({
    mutationFn: ({ memberId, v }: { memberId: string; v: MemberFormValues }) =>
      updateMember(memberId, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member", id] });
      qc.invalidateQueries({ queryKey: ["members"] });
      setEditOpen(false);
    },
  });

  const cancelMut = useMutation({
    mutationFn: (reason: string) => cancelMember(id!, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member", id] });
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["memberships"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setCancelOpen(false);
      setCancelError(null);
    },
    onError: (e: any) => {
      setCancelError(e?.response?.data?.detail ?? "Failed to cancel member.");
    },
  });

  const reactivateMut = useMutation({
    mutationFn: () => reactivateMember(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["member", id] });
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: any) => {
      alert(e?.response?.data?.detail ?? "Failed to reactivate member.");
    },
  });

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500 font-bold">Loading profile…</div>;
  }

  if (isError || !member) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500 text-lg font-bold">Member not found</p>
        <Link to="/members" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">
          ← Back to Members
        </Link>
      </div>
    );
  }

  const activeMembership = memberships.find((m) => m.status === "ACTIVE") ?? null;
  const payments = allPayments.filter((p) => p.memberId === member.id);
  const photoUrl = member.photoBase64
    ? `data:${member.photoContentType ?? "image/jpeg"};base64,${member.photoBase64}`
    : "";
  const initials = member.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const isCancelled = !!member.cancelledAt;

  async function handleUpdate(v: MemberFormValues) {
    await updateMut.mutateAsync({ memberId: member!.id, v });
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/members" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-bold transition">
          <ArrowLeft className="w-4 h-4" /> Back to Members
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-md hover:bg-slate-100 font-bold"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>

          {isCancelled ? (
            <button
              onClick={() => reactivateMut.mutate()}
              disabled={reactivateMut.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {reactivateMut.isPending ? "Reactivating…" : "Reactivate Member"}
            </button>
          ) : (
            <button
              onClick={() => { setCancelError(null); setCancelOpen(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold"
            >
              <XCircle className="w-4 h-4" /> Cancel Member
            </button>
          )}

          <button
            onClick={() => openMemberWhatsApp(member)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button
            onClick={() => printIdCard(member, activeMembership)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold"
          >
            <Printer className="w-4 h-4" /> Print ID Card
          </button>
        </div>
      </div>

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-extrabold text-rose-900">This member is cancelled</p>
            <p className="text-sm text-rose-800 mt-1">
              Cancelled on <b>{new Date(member.cancelledAt!).toLocaleString("en-IN")}</b>
              {member.cancelledByName && <> by <b>{member.cancelledByName}</b></>}
            </p>
            {member.cancelReason && (
              <p className="text-sm text-rose-700 mt-2 bg-white/50 rounded px-3 py-2">
                <b>Reason:</b> {member.cancelReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              disabled={!photoUrl}
              title={photoUrl ? "Click to enlarge" : "No photo"}
              className="w-44 h-44 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-xl mx-auto md:mx-0 transition-transform hover:scale-105 hover:border-white/40 disabled:cursor-default disabled:hover:scale-100"
            >
              {photoUrl ? (
                <img src={photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-extrabold text-white/70">{initials}</span>
              )}
            </button>
            <div className="flex-1 min-w-0 text-center md:text-left">
              <p className="text-indigo-300 font-mono text-sm font-bold tracking-wide">{member.memberCode}</p>
              <h1 className="text-2xl font-extrabold tracking-tight mt-1 truncate">{member.fullName}</h1>
              {member.fatherFullName && (
                <p className="text-slate-300 text-sm mt-0.5">S/o, D/o {member.fatherFullName}</p>
              )}
              <div className="flex items-center gap-3 mt-3 justify-center md:justify-start flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
                  <Package className="w-3 h-3" /> {member.branchName}
                </span>
                <StatusBadge status={member.status} />
                {member.gender && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
                    {member.gender}
                  </span>
                )}
                {member.bloodGroup && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-100">
                    <Droplet className="w-3 h-3" /> {member.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {activeMembership && !isCancelled && (
          <div className="bg-emerald-50 border-t border-emerald-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Active Membership
              </span>
              <span className="text-emerald-800 font-semibold">{activeMembership.planName}</span>
              <span className="text-emerald-700">{fmtDate(activeMembership.startDate)} → {fmtDate(activeMembership.endDate)}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-emerald-800">Paid <b>{money(activeMembership.totalPaid)}</b> / {money(activeMembership.totalPayable)}</span>
              {activeMembership.balanceDue > 0 ? (
                <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                  Due {money(activeMembership.balanceDue)}
                </span>
              ) : (
                <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  Fully Paid
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoCard title="Personal Information" icon={UserIcon}>
          <InfoRow label="Full Name" value={member.fullName} />
          <InfoRow label="Father's Name" value={member.fatherFullName} />
          <InfoRow label="Date of Birth" value={fmtDate(member.dateOfBirth)} />
          <InfoRow label="Gender" value={member.gender} />
          <InfoRow label="Blood Group" value={member.bloodGroup} />
          <InfoRow label="Marital Status" value={member.maritalStatus} />
          <InfoRow label="Occupation" value={member.occupation} />
        </InfoCard>

        <InfoCard title="Contact Information" icon={Phone}>
          <InfoRow label="Mobile" value={member.mobile} icon={Phone} />
          <InfoRow label="WhatsApp" value={member.whatsapp} icon={MessageCircle} />
          <InfoRow label="Email" value={member.email} icon={Mail} />
          <InfoRow label="Address" value={member.address} icon={MapPin} />
          <InfoRow label="City / Area" value={member.city} icon={MapPin} />
          <InfoRow label="PIN Code" value={member.pincode} />
        </InfoCard>

        <InfoCard title="Emergency Contact" icon={Heart}>
          <InfoRow label="Name" value={member.emergencyContactName} />
          <InfoRow label="Relation" value={member.emergencyContactRelation} />
          <InfoRow label="Phone" value={member.emergencyContactPhone} icon={Phone} />
        </InfoCard>

        <InfoCard title="Identity Proof" icon={FileBadge}>
          <InfoRow label="Type" value={member.idProofType} />
          <InfoRow label="Number" value={member.idProofNumber} />
          <InfoRow label="Referred By" value={member.referredBy} />
          <InfoRow label="Registered On" value={fmtDate(member.createdAt)} />
        </InfoCard>
      </div>

      {member.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Notes</p>
          <p className="text-amber-900 font-medium">{member.notes}</p>
        </div>
      )}

      {/* Membership history */}
      <Section title="Membership History" count={memberships.length}>
        {memberships.length === 0 ? (
          <EmptyRow text="No memberships on record" />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Membership #</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberships.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-700">{m.membershipNumber}</td>
                  <td className="px-4 py-3 text-slate-800 font-semibold">{m.planName}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(m.startDate)} → {fmtDate(m.endDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{money(m.totalPayable)}</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-semibold">{money(m.totalPaid)}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-700">{m.balanceDue > 0 ? money(m.balanceDue) : "—"}</td>
                  <td className="px-4 py-3"><MembershipStatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Payment history */}
      <Section title="Payment History" count={payments.length}>
        {payments.length === 0 ? (
          <EmptyRow text="No payments recorded" />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Membership</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Received By</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-700">{p.receiptNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(p.paidAt)}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{p.membershipNumber}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{money(p.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{p.method.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-slate-600">{p.receivedByName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-xs ${
                      p.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Photo lightbox */}
      {photoOpen && photoUrl && (
        <div
          className="fixed inset-0 bg-black/85 z-[70] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPhotoOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPhotoOpen(false)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            title="Close (Esc)"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <img
            src={photoUrl}
            alt={member.fullName}
            className="max-w-[80vw] max-h-[80vh] w-auto h-auto rounded-2xl shadow-2xl object-contain bg-white"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white/90">
            <p className="text-lg font-extrabold">{member.fullName}</p>
            <p className="text-sm font-mono text-white/60">{member.memberCode}</p>
          </div>
        </div>
      )}

      {/* Edit modal */}
      <MemberFormModal
        open={editOpen}
        member={member}
        branches={branches}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />

      {/* Cancel member modal */}
      <CancelMemberModal
        open={cancelOpen}
        member={member}
        onClose={() => { if (!cancelMut.isPending) { setCancelOpen(false); setCancelError(null); } }}
        onConfirm={async (reason) => { await cancelMut.mutateAsync(reason); }}
        isSubmitting={cancelMut.isPending}
        error={cancelError}
      />
    </div>
  );
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
        <Icon className="w-4 h-4 text-indigo-600" />
        <h3 className="font-extrabold text-slate-800">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: typeof Phone }) {
  const isEmpty = !value || value === "";
  return (
    <div className="px-4 py-2.5 flex items-start justify-between gap-3">
      <span className="text-slate-500 font-semibold flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label}
      </span>
      <span className={`text-right font-semibold break-words ${isEmpty ? "text-slate-300" : "text-slate-800"}`}>
        {isEmpty ? "—" : value}
      </span>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
          {title}
          <span className="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{count}</span>
        </h2>
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="px-5 py-8 text-center text-slate-500 font-semibold">{text}</div>;
}

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === "NO_MEMBERSHIP") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-500/20 border border-slate-400/30 text-slate-200">
        <AlertTriangle className="w-3 h-3" /> No Membership
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-100">
        <XCircle className="w-3 h-3" /> Cancelled
      </span>
    );
  }
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100">
        <CheckCircle2 className="w-3 h-3" /> Active
      </span>
    );
  }
  if (status === "FROZEN") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-100">
        <Clock className="w-3 h-3" /> Frozen
      </span>
    );
  }
  if (status === "EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-500/20 border border-slate-400/30 text-slate-200">
        <XCircle className="w-3 h-3" /> Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-500/20 border border-slate-400/30 text-slate-200">
      {status}
    </span>
  );
}

function MembershipStatusBadge({ status }: { status: string }) {
  const styles =
    status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "FROZEN" ? "bg-amber-50 text-amber-700 border-amber-200"
    : status === "CANCELLED" ? "bg-rose-50 text-rose-700 border-rose-200"
    : status === "EXPIRED" ? "bg-slate-100 text-slate-600 border-slate-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
  return <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-xs border ${styles}`}>{status}</span>;
}

