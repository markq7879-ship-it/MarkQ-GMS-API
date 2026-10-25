import { Construction } from "lucide-react";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";

interface Props {
  title: string;
  subtitle?: string;
}

export default function ComingSoon({ title, subtitle }: Props) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="bg-white border border-slate-200 rounded-lg">
        <EmptyState
          icon={Construction}
          title="Module under construction"
          description={`The ${title} module will be implemented in an upcoming milestone.`}
        />
      </div>
    </div>
  );
}
