import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../components/Modal";
import type { Branch } from "./types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  branch?: Branch | null;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

export default function BranchModal({ open, branch, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    reset({ name: branch?.name ?? "" });
  }, [branch, reset]);

  return (
    <Modal
      open={open}
      title={branch ? "Edit Branch" : "Add Branch"}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="submit" form="branch-form" disabled={isSubmitting}
            className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? "Saving…" : branch ? "Update" : "Create"}
          </button>
        </>
      }
    >
      <form id="branch-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Branch Name *</label>
          <input type="text" autoFocus {...register("name")}
            placeholder="e.g. Downtown Branch"
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
      </form>
    </Modal>
  );
}