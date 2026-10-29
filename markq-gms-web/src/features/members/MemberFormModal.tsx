import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import PhotoPicker from "./PhotoPicker";
import { checkMobile } from "./api";
import type { Branch } from "../branches/types";
import type { Member, MemberFormValues } from "./types";

const todayStr = new Date().toISOString().slice(0, 10);

const schema = z.object({
  fullName: z.string().min(2, "Name is required").max(200),
  fatherFullName: z.string().max(200).optional().or(z.literal("")),
  mobile: z.string().min(6, "Mobile is required").max(20),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || v <= todayStr, "Date of birth cannot be in the future"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "UNKNOWN"]).optional().or(z.literal("")),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "OTHER"]).optional().or(z.literal("")),
  occupation: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  pincode: z.string().max(20).optional().or(z.literal("")),
  idProofType: z.enum(["AADHAR", "PAN", "PASSPORT", "DRIVING_LICENSE", "VOTER_ID", "OTHER"]).optional().or(z.literal("")),
  idProofNumber: z.string().max(50).optional().or(z.literal("")),
  emergencyContactName: z.string().max(200).optional().or(z.literal("")),
  emergencyContactRelation: z.string().max(50).optional().or(z.literal("")),
  emergencyContactPhone: z.string().max(20).optional().or(z.literal("")),
  referredBy: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  branchId: z.string().optional().or(z.literal("")),
});
type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  member?: Member | null;
  branches: Branch[];
  onClose: () => void;
  onSubmit: (values: MemberFormValues) => Promise<void>;
}

export default function MemberFormModal({ open, member, branches, onClose, onSubmit }: Props) {
  const [photo, setPhoto] = useState<{ base64: string; contentType: string } | null>(null);
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [dupWarning, setDupWarning] = useState<{ code: string; name: string } | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<Values>({
      resolver: zodResolver(schema),
      defaultValues: { fullName: "", mobile: "", branchId: "" },
    });

  const mobileValue = watch("mobile");

  useEffect(() => {
    // Prefer: member's branch → first active branch → empty (backend will auto-assign)
    const defaultBranchId =
      member?.branchId ?? branches.find((b) => b.isActive)?.id ?? branches[0]?.id ?? "";

    reset({
      fullName: member?.fullName ?? "",
      fatherFullName: member?.fatherFullName ?? "",
      mobile: member?.mobile ?? "",
      whatsapp: member?.whatsapp ?? "",
      email: member?.email ?? "",
      dateOfBirth: member?.dateOfBirth ?? "",
      gender: member?.gender ?? undefined,
      bloodGroup: member?.bloodGroup ?? undefined,
      maritalStatus: member?.maritalStatus ?? undefined,
      occupation: member?.occupation ?? "",
      address: member?.address ?? "",
      city: member?.city ?? "",
      pincode: member?.pincode ?? "",
      idProofType: member?.idProofType ?? undefined,
      idProofNumber: member?.idProofNumber ?? "",
      emergencyContactName: member?.emergencyContactName ?? "",
      emergencyContactRelation: member?.emergencyContactRelation ?? "",
      emergencyContactPhone: member?.emergencyContactPhone ?? "",
      referredBy: member?.referredBy ?? "",
      notes: member?.notes ?? "",
      branchId: defaultBranchId,
    });
    setPhoto(
      member?.photoBase64
        ? { base64: member.photoBase64, contentType: member.photoContentType ?? "image/jpeg" }
        : null
    );
    setSameAsMobile(!!member?.mobile && member.mobile === member.whatsapp);
    setDupWarning(null);
  }, [member, branches, reset]);

  useEffect(() => {
    if (sameAsMobile) setValue("whatsapp", mobileValue);
  }, [sameAsMobile, mobileValue, setValue]);

  useEffect(() => {
    if (!open || !mobileValue || mobileValue.length < 6) {
      setDupWarning(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await checkMobile(mobileValue, member?.id);
        setDupWarning(res.exists && res.memberCode ? { code: res.memberCode, name: res.memberName ?? "" } : null);
      } catch {
        setDupWarning(null);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [mobileValue, member?.id, open]);

  async function handleFormSubmit(v: Values) {
    await onSubmit({
      fullName: v.fullName.trim(),
      mobile: v.mobile.trim(),
      whatsapp: v.whatsapp || undefined,
      email: v.email || undefined,
      dateOfBirth: v.dateOfBirth || undefined,
      gender: (v.gender || undefined) as any,
      bloodGroup: (v.bloodGroup || undefined) as any,
      maritalStatus: (v.maritalStatus || undefined) as any,
      occupation: v.occupation || undefined,
      address: v.address || undefined,
      city: v.city || undefined,
      pincode: v.pincode || undefined,
      idProofType: (v.idProofType || undefined) as any,
      idProofNumber: v.idProofNumber || undefined,
      emergencyContactName: v.emergencyContactName || undefined,
      emergencyContactRelation: v.emergencyContactRelation || undefined,
      emergencyContactPhone: v.emergencyContactPhone || undefined,
      referredBy: v.referredBy || undefined,
      notes: v.notes || undefined,
      branchId: v.branchId || "",
      photoBase64: photo?.base64,
      photoContentType: photo?.contentType,
    });
  }

  return (
    <Modal
      open={open}
      title={member ? "Edit Member" : "Add Member"}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" form="member-form" disabled={isSubmitting || !!dupWarning}
            className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? "Saving…" : member ? "Update" : "Create"}
          </button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <PhotoPicker
            photoBase64={photo?.base64}
            photoContentType={photo?.contentType}
            onChange={setPhoto}
          />
        </div>

        {/* Personal */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 w-full">
            Personal Information
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name *</label>
              <input {...register("fullName")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Father's Name</label>
              <input {...register("fatherFullName")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <input type="date" max={todayStr} {...register("dateOfBirth")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Gender</label>
              <select {...register("gender")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">—</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Blood Group</label>
              <select {...register("bloodGroup")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">—</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Marital Status</label>
              <select {...register("maritalStatus")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">—</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Occupation</label>
              <input {...register("occupation")} placeholder="e.g. Software Engineer, Business Owner"
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </fieldset>

        {/* Contact */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 w-full">
            Contact Information
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Mobile *</label>
              <input {...register("mobile")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile.message}</p>}
              {dupWarning && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Already registered: {dupWarning.code} · {dupWarning.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">WhatsApp</label>
              <input {...register("whatsapp")} disabled={sameAsMobile}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500" />
              <label className="text-xs text-slate-600 flex items-center gap-2 mt-1.5">
                <input type="checkbox" checked={sameAsMobile}
                  onChange={(e) => {
                    setSameAsMobile(e.target.checked);
                    if (e.target.checked) setValue("whatsapp", mobileValue);
                  }} className="w-3.5 h-3.5 rounded border-slate-300" />
                Same as mobile
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" {...register("email")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <textarea {...register("address")} rows={2}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">City / Area</label>
              <input {...register("city")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">PIN Code</label>
              <input {...register("pincode")} maxLength={20}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </fieldset>

        {/* Identity */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 w-full">
            Identity Proof <span className="text-xs font-normal text-slate-400">(optional)</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">ID Proof Type</label>
              <select {...register("idProofType")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">—</option>
                <option value="AADHAR">Aadhar</option>
                <option value="PAN">PAN</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="VOTER_ID">Voter ID</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">ID Proof Number</label>
              <input {...register("idProofNumber")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </fieldset>

        {/* Emergency */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 w-full">
            Emergency Contact
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input {...register("emergencyContactName")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Relation</label>
              <input {...register("emergencyContactRelation")} placeholder="e.g. Spouse, Parent"
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input {...register("emergencyContactPhone")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </fieldset>

        {/* Other */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2 w-full">
            Other Details
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Branch</label>
              <select {...register("branchId")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Auto-assign to first branch</option>
                {branches.filter((b) => b.isActive).map((b) => (
                  <option key={b.id} value={b.id}>{b.code} · {b.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">If left empty, member will be assigned to the first active branch.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Referred By</label>
              <input {...register("referredBy")} placeholder="Friend, trainer, walk-in…"
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <textarea {...register("notes")} rows={3}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

