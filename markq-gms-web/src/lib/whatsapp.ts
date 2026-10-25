import type { Payment } from "../features/payments/types";
import type { Member } from "../features/members/types";

export function sanitizePhone(phone: string): string {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.substring(1);
  if (digits.length === 10) return "91" + digits;
  return digits;
}

export function getPreferredPhone(payment: Payment): string | null {
  const wa = (payment.memberWhatsApp ?? "").trim();
  const mob = (payment.memberMobile ?? "").trim();
  const chosen = wa || mob;
  return chosen ? sanitizePhone(chosen) : null;
}

export function formatReceiptMessage(payment: Payment): string {
  const paid = `\u20B9${payment.amount.toFixed(2)}`;
  const total = `\u20B9${payment.membershipTotal.toFixed(2)}`;
  const balance = `\u20B9${payment.balanceAfter.toFixed(2)}`;
  const date = new Date(payment.paidAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [];
  lines.push("\uD83E\uDDFE *Payment Receipt \u2014 Mark-Q GMS*");
  lines.push("");
  lines.push(`Receipt: ${payment.receiptNumber}`);
  lines.push(`Date: ${date}`);
  lines.push(`Member: ${payment.memberName} (${payment.memberCode})`);
  lines.push(`Membership: ${payment.membershipNumber}`);
  lines.push("");
  lines.push(`*Amount Paid:* ${paid}`);
  lines.push(`Method: ${payment.method.replace("_", " ")}`);
  if (payment.reference) lines.push(`Reference: ${payment.reference}`);
  lines.push("");
  lines.push(`Membership Total: ${total}`);
  lines.push(`Balance Due: ${balance}`);
  if (payment.balanceAfter > 0) {
    lines.push("");
    lines.push(`_Please clear the outstanding balance at your earliest._`);
  }
  lines.push("");
  lines.push(`Received By: ${payment.receivedByName}`);
  lines.push("");
  lines.push("Thank you for your payment!");
  lines.push("\u2014 Mark-Q GMS");

  return lines.join("\n");
}

export function buildWhatsAppUrl(payment: Payment): string | null {
  const phone = getPreferredPhone(payment);
  if (!phone) return null;
  const text = encodeURIComponent(formatReceiptMessage(payment));
  return `https://wa.me/${phone}?text=${text}`;
}

export function openWhatsApp(payment: Payment): boolean {
  const url = buildWhatsAppUrl(payment);
  if (!url) {
    alert("This member has no mobile number saved. Add a mobile number first.");
    return false;
  }
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

/** Open WhatsApp with a greeting to the member — no payment context */
export function openMemberWhatsApp(member: Member, customMessage?: string): boolean {
  const phone = (member.whatsapp ?? "").trim() || (member.mobile ?? "").trim();
  if (!phone) {
    alert("This member has no mobile number saved.");
    return false;
  }
  const sanitized = sanitizePhone(phone);
  const defaultMsg =
    `Hello ${member.fullName} \uD83D\uDC4B\n\n` +
    `This is a message from your gym.\n\n` +
    `Member: ${member.fullName}\n` +
    `Member Code: ${member.memberCode}\n\n` +
    `How can we help you today?`;
  const text = encodeURIComponent(customMessage ?? defaultMsg);
  window.open(`https://wa.me/${sanitized}?text=${text}`, "_blank", "noopener,noreferrer");
  return true;
}
