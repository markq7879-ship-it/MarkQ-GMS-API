import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-slate-800 font-medium">{title}</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
    </div>
  );
}
