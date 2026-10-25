import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Wallet, XCircle, Receipt, MessageCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import TableSkeleton from "../../components/TableSkeleton";
import { createPayment, listPayments, voidPayment } from "./api";
import CreatePaymentModal from "./CreatePaymentModal";
import VoidPaymentModal from "./VoidPaymentModal";
import ReceiptModal from "./ReceiptModal";
import { openWhatsApp } from "../../lib/whatsapp";
import type { CreatePaymentValues, Payment, VoidPaymentValues } from "./types";

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Payment | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<Payment | null>(null);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", search],
    queryFn: () => listPayments(search || undefined),
  });

  const createMut = useMutation({
    mutationFn: (v: CreatePaymentValues) => createPayment(v),
    onSuccess: (payment) => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["memberships"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setCreateOpen(false);
      setReceiptTarget(payment);
    },
  });

  const voidMut = useMutation({
    mutationFn: ({ id, v }: { id: string; v: VoidPaymentValues }) => voidPayment(id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["memberships"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setVoidTarget(null);
    },
  });

  return (
    <div>
      <PageHeader title="Payments"
        subtitle="Record and manage payments. Receipts are auto-generated. Payments can only be voided, never deleted."
        actions={
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search receipt no., member, code…"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {isLoading ? <TableSkeleton /> : payments.length === 0 ? (
          <EmptyState icon={Wallet} title="No payments recorded"
            description="Record a payment against a membership with outstanding balance." />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Membership</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Received By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => {
                const hasPhone = !!(p.memberWhatsApp || p.memberMobile);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-700">{p.receiptNumber}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{p.memberName}</div>
                      <div className="font-mono text-slate-500">{p.memberCode}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{p.membershipNumber}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">₹{p.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.method}</td>
                    <td className="px-4 py-3 text-slate-600">{p.receivedByName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full ${
                        p.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button onClick={() => setReceiptTarget(p)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                        <Receipt className="w-4 h-4" /> Receipt
                      </button>
                      {p.status === "COMPLETED" && hasPhone && (
                        <button onClick={() => openWhatsApp(p)}
                          title={`Send bill to ${p.memberWhatsApp || p.memberMobile}`}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </button>
                      )}
                      {p.status === "COMPLETED" && (
                        <button onClick={() => setVoidTarget(p)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700">
                          <XCircle className="w-4 h-4" /> Void
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <CreatePaymentModal open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (v) => { await createMut.mutateAsync(v); }} />

      <VoidPaymentModal open={!!voidTarget}
        onClose={() => setVoidTarget(null)}
        onSubmit={async (v) => { if (voidTarget) await voidMut.mutateAsync({ id: voidTarget.id, v }); }} />

      <ReceiptModal open={!!receiptTarget} payment={receiptTarget} onClose={() => setReceiptTarget(null)} />
    </div>
  );
}
