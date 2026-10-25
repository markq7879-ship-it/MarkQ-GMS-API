import { X, Printer, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import type { Payment } from "./types";
import { buildWhatsAppUrl, openWhatsApp } from "../../lib/whatsapp";

interface Props {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
}

export default function ReceiptModal({ open, payment, onClose }: Props) {
  if (!open || !payment) return null;

  const waUrl = buildWhatsAppUrl(payment);
  const hasPhone = !!waUrl;
  const isVoided = payment.status === "VOIDED";
  const fullyPaid = payment.balanceAfter <= 0;

  const paidDate = new Date(payment.paidAt);
  const dateStr = paidDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = paidDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  function handlePrint() {
    const w = window.open("", "_blank", "width=800,height=1000");
    if (!w) return;
    w.document.write(generatePrintHtml(payment!, isVoided, fullyPaid, dateStr, timeStr));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">

        {/* ============ HEADER ============ */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6">
          <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/40 shrink-0">
                <span className="text-white font-extrabold text-lg tracking-tight">MQ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-tight">Mark-Q GMS</h1>
                <p className="text-[10px] uppercase tracking-[0.15em] text-indigo-300 font-bold leading-tight mt-0.5">
                  Gym Management System
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition shrink-0"
              title="Close">
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>

          <div className="relative mt-6 pt-5 border-t border-white/10">
            <h2 className="text-3xl font-extrabold tracking-tight">PAYMENT RECEIPT</h2>
            <p className="text-sm text-indigo-200 mt-1.5 font-medium">
              Payment acknowledgment · Keep this receipt for your records
            </p>
          </div>
        </div>

        {/* ============ BODY ============ */}
        <div className="p-6 space-y-5 bg-slate-50/40">

          {/* Receipt + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.12em] text-indigo-600 font-extrabold">
                Receipt Number
              </p>
              <p className="text-base font-extrabold text-slate-900 mt-1.5 font-mono">
                {payment.receiptNumber}
              </p>
            </div>

            <div className={`rounded-xl border p-4 shadow-sm ${
              isVoided ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"
            }`}>
              <p className={`text-[10px] uppercase tracking-[0.12em] font-extrabold ${
                isVoided ? "text-rose-700" : "text-emerald-700"
              }`}>
                Payment Status
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                {isVoided ? (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <p className={`text-base font-extrabold ${
                  isVoided ? "text-rose-700" : "text-emerald-700"
                }`}>
                  {isVoided ? "Voided" : "Payment Received"}
                </p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 font-extrabold">
              Date & Time
            </p>
            <p className="text-base font-bold text-slate-900 mt-1.5">
              {dateStr}
              <span className="text-slate-300 mx-2 font-normal">·</span>
              {timeStr}
            </p>
          </div>

          {/* Member Information */}
          <SectionTitle>Member Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoBox label="Member Name" value={payment.memberName} accent />
            <InfoBox label="Member ID" value={payment.memberCode} mono />
            <InfoBox label="Membership ID" value={payment.membershipNumber} mono />
          </div>

          {/* Payment Details */}
          <SectionTitle>Payment Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoBox label="Payment Method" value={payment.method.replace(/_/g, " ")} />
            <InfoBox label="Transaction Reference" value={payment.reference || "—"} mono />
            <InfoBox label="Received By" value={payment.receivedByName} />
          </div>

          {/* Payment Summary */}
          <div className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-700 font-extrabold">
                Payment Summary
              </p>
            </div>
            <div className="p-4 space-y-3">
              <SummaryRow label="Membership Total" value={`₹${payment.membershipTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} />
              <SummaryRow label="Amount Paid" value={`₹${payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} emerald />

              <div className="pt-3 border-t-2 border-dashed border-slate-200">
                <div className={`rounded-lg p-4 ${
                  fullyPaid
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-amber-50 border border-amber-200"
                }`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className={`text-[10px] uppercase tracking-[0.12em] font-extrabold ${
                        fullyPaid ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        Outstanding Balance
                      </p>
                      <p className={`text-xs font-semibold mt-0.5 ${
                        fullyPaid ? "text-emerald-600" : "text-amber-700"
                      }`}>
                        {fullyPaid ? "Fully paid · No balance due" : "Partially paid · Further payment pending"}
                      </p>
                    </div>
                    <p className={`text-2xl font-extrabold ${
                      fullyPaid ? "text-emerald-700" : "text-amber-700"
                    }`}>
                      ₹{payment.balanceAfter.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isVoided && payment.voidReason && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-rose-700 font-extrabold">
                Void Information
              </p>
              <p className="text-sm font-semibold text-rose-800 mt-1">
                {payment.voidedAt && `Voided on ${new Date(payment.voidedAt).toLocaleString("en-IN")}`}
                {payment.voidReason && ` · ${payment.voidReason}`}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t-2 border-dashed border-slate-200">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-extrabold text-slate-800">
                  Thank you for choosing Mark-Q GMS
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Please retain this receipt for your records. Contact the gym for payment queries or corrections.
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="w-40 pt-8 border-t border-slate-300">
                  <p className="text-xs font-extrabold text-slate-700">Authorized Signature</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{payment.receivedByName}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.12em] text-slate-400 font-extrabold flex-wrap">
              <span>System Generated · Mark-Q GMS</span>
              <span>All amounts in Indian Rupees (INR)</span>
            </div>
          </div>
        </div>

        {/* ============ ACTION BAR ============ */}
        <div className="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 flex-wrap">
          <button onClick={onClose}
            className="px-4 py-2 font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-100 transition">
            Close
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-100 transition">
            <Printer className="w-4 h-4" /> Print
          </button>
          {!isVoided && (
            <button
              onClick={() => openWhatsApp(payment)}
              disabled={!hasPhone}
              title={hasPhone ? "Send receipt on WhatsApp" : "No mobile number saved"}
              className="flex items-center gap-1.5 px-4 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              <MessageCircle className="w-4 h-4" /> Send on WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 font-extrabold mt-1">
      {children}
    </p>
  );
}

function InfoBox({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3.5 shadow-sm ${
      accent ? "border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white" : "border-slate-200 bg-white"
    }`}>
      <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-extrabold">{label}</p>
      <p className={`mt-1.5 font-bold text-slate-900 break-words ${
        mono ? "font-mono text-xs" : "text-sm"
      }`}>
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value, emerald }: { label: string; value: string; emerald?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className={`text-base font-extrabold ${emerald ? "text-emerald-700" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

/* ---------- print template (self-contained, no Tailwind) ---------- */

function generatePrintHtml(
  payment: Payment,
  isVoided: boolean,
  fullyPaid: boolean,
  dateStr: string,
  timeStr: string,
): string {
  const safe = (s: string | null | undefined): string =>
    (s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
    );

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Receipt ${safe(payment.receiptNumber)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Calibri', 'Carlito', Arial, sans-serif;
    background: #f1f5f9;
    padding: 24px;
    color: #1e293b;
    font-size: 14px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice {
    max-width: 720px;
    margin: 0 auto;
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,.08);
  }

  /* HEADER */
  .header {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    color: #fff;
    padding: 24px 28px;
  }
  .brand-row { display: flex; align-items: center; gap: 12px; }
  .brand-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #4338ca);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 18px; color: #fff;
    box-shadow: 0 4px 12px rgba(79,70,229,.4);
  }
  .brand-name { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
  .brand-sub {
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.15em; color: #a5b4fc;
    font-weight: 800; margin-top: 2px;
  }
  .title-block {
    margin-top: 20px; padding-top: 18px;
    border-top: 1px solid rgba(255,255,255,.1);
  }
  .title { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; }
  .subtitle { font-size: 13px; color: #c7d2fe; margin-top: 6px; font-weight: 500; }

  /* BODY */
  .body { padding: 24px 28px; background: #f8fafc; }
  .section-title {
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.12em; color: #64748b;
    font-weight: 800; margin: 20px 0 8px;
  }
  .section-title:first-child { margin-top: 0; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

  .card {
    background: #fff; border-radius: 12px;
    padding: 14px 16px; border: 1px solid #e2e8f0;
    box-shadow: 0 1px 2px rgba(0,0,0,.03);
  }
  .card-indigo { border-color: #c7d2fe; background: #fff; }
  .card-emerald { border-color: #a7f3d0; background: #ecfdf5; }
  .card-rose { border-color: #fecdd3; background: #fff1f2; }
  .card-slate { background: #fff; }

  .label {
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.12em; color: #64748b;
    font-weight: 800;
  }
  .label-indigo { color: #4f46e5; }
  .label-emerald { color: #047857; }
  .label-rose { color: #be123c; }

  .value { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 6px; }
  .value-mono { font-family: 'Courier New', monospace; font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 6px; }
  .value-emerald { color: #047857; }
  .value-rose { color: #be123c; }

  .status-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
  .status-icon {
    width: 20px; height: 20px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: #fff;
  }
  .status-ok { background: #10b981; }
  .status-void { background: #f43f5e; }

  .dot { color: #cbd5e1; margin: 0 8px; font-weight: 400; }

  /* SUMMARY */
  .summary {
    border-radius: 12px; border: 2px solid #e2e8f0;
    background: #fff; overflow: hidden; margin-top: 20px;
  }
  .summary-header {
    background: linear-gradient(90deg, #f1f5f9, #f8fafc);
    padding: 10px 16px; border-bottom: 1px solid #e2e8f0;
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.12em; color: #334155; font-weight: 800;
  }
  .summary-body { padding: 16px; }
  .row {
    display: flex; justify-content: space-between;
    align-items: center; padding: 6px 0;
  }
  .row-label { font-size: 14px; font-weight: 600; color: #475569; }
  .row-value { font-size: 16px; font-weight: 800; color: #0f172a; }
  .row-value.emerald { color: #047857; }

  .balance {
    margin-top: 12px; padding: 14px 16px; border-radius: 10px;
    display: flex; justify-content: space-between;
    align-items: center; gap: 12px;
    border-top: 2px dashed #e2e8f0;
  }
  .balance-ok {
    background: #ecfdf5; border: 1px solid #a7f3d0;
    border-top: 2px solid #a7f3d0;
  }
  .balance-pending {
    background: #fffbeb; border: 1px solid #fde68a;
    border-top: 2px solid #fde68a;
  }
  .balance-label {
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.12em; font-weight: 800;
  }
  .balance-ok .balance-label { color: #047857; }
  .balance-pending .balance-label { color: #b45309; }
  .balance-note {
    font-size: 12px; font-weight: 600; margin-top: 2px;
  }
  .balance-ok .balance-note { color: #059669; }
  .balance-pending .balance-note { color: #d97706; }
  .balance-value { font-size: 24px; font-weight: 800; }
  .balance-ok .balance-value { color: #047857; }
  .balance-pending .balance-value { color: #b45309; }

  /* VOID */
  .void {
    background: #fff1f2; border: 1px solid #fecdd3;
    border-radius: 12px; padding: 14px 16px; margin-top: 20px;
  }
  .void-label {
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.12em; color: #be123c; font-weight: 800;
  }
  .void-text { font-size: 13px; color: #9f1239; margin-top: 4px; font-weight: 600; }

  /* FOOTER */
  .footer {
    margin-top: 24px; padding-top: 18px;
    border-top: 2px dashed #e2e8f0;
  }
  .footer-row {
    display: flex; justify-content: space-between;
    align-items: flex-start; gap: 24px; flex-wrap: wrap;
  }
  .thanks { font-size: 14px; font-weight: 800; color: #1e293b; }
  .note { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.6; max-width: 380px; }
  .signature { text-align: right; min-width: 160px; }
  .sig-line { width: 160px; border-top: 1px solid #cbd5e1; margin: 32px 0 0 auto; }
  .sig-label {
    font-size: 11px; font-weight: 800; color: #334155;
    margin-top: 6px;
  }
  .sig-name { font-size: 11px; color: #64748b; margin-top: 2px; }

  .footer-bottom {
    margin-top: 20px; display: flex; justify-content: space-between;
    font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.12em; color: #94a3b8;
    font-weight: 800; flex-wrap: wrap; gap: 8px;
  }

  @media print {
    body { background: #fff; padding: 0; }
    .invoice { box-shadow: none; border-radius: 0; }
    @page { margin: 12mm; }
  }
</style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="brand-row">
        <div class="brand-icon">MQ</div>
        <div>
          <div class="brand-name">Mark-Q GMS</div>
          <div class="brand-sub">Gym Management System</div>
        </div>
      </div>
      <div class="title-block">
        <div class="title">PAYMENT RECEIPT</div>
        <div class="subtitle">Payment acknowledgment · Keep this receipt for your records</div>
      </div>
    </div>

    <div class="body">

      <div class="grid-2">
        <div class="card card-indigo">
          <div class="label label-indigo">Receipt Number</div>
          <div class="value-mono">${safe(payment.receiptNumber)}</div>
        </div>
        <div class="card ${isVoided ? "card-rose" : "card-emerald"}">
          <div class="label ${isVoided ? "label-rose" : "label-emerald"}">Payment Status</div>
          <div class="status-row">
            <span class="status-icon ${isVoided ? "status-void" : "status-ok"}">${isVoided ? "✕" : "✓"}</span>
            <span class="value ${isVoided ? "value-rose" : "value-emerald"}">${isVoided ? "Voided" : "Payment Received"}</span>
          </div>
        </div>
      </div>

      <div class="card card-slate" style="margin-top:12px;">
        <div class="label">Date &amp; Time</div>
        <div class="value">${safe(dateStr)}<span class="dot">·</span>${safe(timeStr)}</div>
      </div>

      <div class="section-title">Member Information</div>
      <div class="grid-3">
        <div class="card">
          <div class="label">Member Name</div>
          <div class="value">${safe(payment.memberName)}</div>
        </div>
        <div class="card">
          <div class="label">Member ID</div>
          <div class="value-mono">${safe(payment.memberCode)}</div>
        </div>
        <div class="card">
          <div class="label">Membership ID</div>
          <div class="value-mono">${safe(payment.membershipNumber)}</div>
        </div>
      </div>

      <div class="section-title">Payment Details</div>
      <div class="grid-3">
        <div class="card">
          <div class="label">Payment Method</div>
          <div class="value">${safe(payment.method.replace(/_/g, " "))}</div>
        </div>
        <div class="card">
          <div class="label">Transaction Reference</div>
          <div class="value-mono">${safe(payment.reference || "—")}</div>
        </div>
        <div class="card">
          <div class="label">Received By</div>
          <div class="value">${safe(payment.receivedByName)}</div>
        </div>
      </div>

      <div class="summary">
        <div class="summary-header">Payment Summary</div>
        <div class="summary-body">
          <div class="row">
            <span class="row-label">Membership Total</span>
            <span class="row-value">₹${payment.membershipTotal.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="row-label">Amount Paid</span>
            <span class="row-value emerald">₹${payment.amount.toFixed(2)}</span>
          </div>
          <div class="balance ${fullyPaid ? "balance-ok" : "balance-pending"}">
            <div>
              <div class="balance-label">Outstanding Balance</div>
              <div class="balance-note">
                ${fullyPaid ? "Fully paid · No balance due" : "Partially paid · Further payment pending"}
              </div>
            </div>
            <div class="balance-value">₹${payment.balanceAfter.toFixed(2)}</div>
          </div>
        </div>
      </div>

      ${isVoided && payment.voidReason ? `
      <div class="void">
        <div class="void-label">Void Information</div>
        <div class="void-text">
          ${payment.voidedAt ? `Voided on ${safe(new Date(payment.voidedAt).toLocaleString("en-IN"))}` : ""}
          ${payment.voidReason ? ` · ${safe(payment.voidReason)}` : ""}
        </div>
      </div>
      ` : ""}

      <div class="footer">
        <div class="footer-row">
          <div>
            <div class="thanks">Thank you for choosing Mark-Q GMS</div>
            <div class="note">
              Please retain this receipt for your records.
              Contact the gym for payment queries or corrections.
            </div>
          </div>
          <div class="signature">
            <div class="sig-line"></div>
            <div class="sig-label">Authorized Signature</div>
            <div class="sig-name">${safe(payment.receivedByName)}</div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>System Generated · Mark-Q GMS</span>
          <span>All amounts in Indian Rupees (INR)</span>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
}
