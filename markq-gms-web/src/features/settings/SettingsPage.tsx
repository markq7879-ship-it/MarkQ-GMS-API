import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import { getSettings, updateSettings } from "./api";

const schema = z.object({
  name: z.string().min(2).max(200),
  gstEnabled: z.boolean(),
  gstPercent: z.coerce.number().min(0).max(100),
  gstIncludedInPrice: z.boolean(),
  address: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
});
type Values = z.infer<typeof schema>;

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", gstEnabled: false, gstPercent: 0, gstIncludedInPrice: false,
      address: "", phone: "", email: "",
    },
  });

  useEffect(() => {
    if (data) reset({
      name: data.name,
      gstEnabled: data.gstEnabled,
      gstPercent: data.gstPercent,
      gstIncludedInPrice: data.gstIncludedInPrice,
      address: data.address ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
    });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  if (isLoading) return <div className="text-slate-500 text-sm">Loadingâ€¦</div>;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Organization profile and GST configuration. Applies to every branch." />

      <form onSubmit={handleSubmit((v) => saveMut.mutateAsync(v))} className="space-y-6 max-w-2xl">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Organization</h2>

          <div>
            <label className="text-sm font-medium text-slate-700">Organization Name *</label>
            <input {...register("name")}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <input {...register("address")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input {...register("phone")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input type="email" {...register("email")}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">GST</h2>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register("gstEnabled")}
              className="w-4 h-4 rounded border-slate-300" />
            GST enabled
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">GST %</label>
              <input type="number" step="0.01" {...register("gstPercent")}
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" {...register("gstIncludedInPrice")}
                  className="w-4 h-4 rounded border-slate-300" />
                GST included in price
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={!isDirty || isSubmitting}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-40">
            {isSubmitting ? "Savingâ€¦" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
