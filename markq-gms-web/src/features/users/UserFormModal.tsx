import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/Modal";
import type { Branch } from "../branches/types";
import type { UserSummary } from "./types";

const baseSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().optional().or(z.literal("")),
  fullName: z.string().min(2, "Name is required").max(200),
  phone: z.string().max(20).optional().or(z.literal("")),
  role: z.enum(["OWNER", "ADMIN"]),
  branchIds: z.array(z.string()).default([]),
});
type Values = z.infer<typeof baseSchema>;

interface Props {
  open: boolean;
  user?: UserSummary | null;
  branches: Branch[];
  onClose: () => void;
  onSubmit: (v: { email: string; password: string; fullName: string; phone?: string; role: "OWNER"|"ADMIN"; branchIds: string[] }) => Promise<void>;
}

export default function UserFormModal({ open, user, branches, onClose, onSubmit }: Props) {
  const isEdit = !!user;
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<z.input<typeof baseSchema>, any, z.output<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      email: "", password: "", fullName: "", phone: "", role: "ADMIN", branchIds: [],
    },
  });

  useEffect(() => {
    reset({
      email: user?.email ?? "",
      password: "",
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      role: user?.role ?? "ADMIN",
      branchIds: user?.branchIds ?? [],
    });
  }, [user, reset]);

  const role = watch("role");

  return (
    <Modal open={open} title={isEdit ? "Edit User" : "Add User"} onClose={onClose} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" form="user-form" disabled={isSubmitting}
            className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? "Savingâ€¦" : isEdit ? "Update" : "Create"}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit((v) => onSubmit({ ...v, password: v.password ?? "" }))}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Full Name *</label>
          <input {...register("fullName")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Email *</label>
          <input type="email" {...register("email")} disabled={isEdit}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm disabled:bg-slate-50" />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Phone</label>
          <input {...register("phone")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        </div>

        {!isEdit && (
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Password *</label>
            <input type="password" {...register("password")}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <p className="text-xs text-slate-500 mt-1">Minimum 8 characters. User can change it later.</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700">Role *</label>
          <select {...register("role")}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </select>
        </div>

        {role === "ADMIN" && (
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 block mb-2">Assigned Branches</label>
            <div className="grid grid-cols-2 gap-2">
              {branches.map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" value={b.id} {...register("branchIds")}
                    className="w-4 h-4 rounded border-slate-300" />
                  {b.code} Â· {b.name}
                </label>
              ))}
              {branches.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2">No branches exist yet. Create branches first.</p>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
