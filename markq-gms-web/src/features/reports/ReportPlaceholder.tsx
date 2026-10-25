import { useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { FileBarChart } from "lucide-react";

const titles: Record<string, string> = {
  members: "Member Report",
  attendance: "Attendance Report",
  revenue: "Revenue Report",
  "pending-payments": "Pending Payment Report",
  "expired-memberships": "Expired Membership Report",
  expenses: "Expense Report",
  income: "Income Report",
  "profit-loss": "Profit & Loss Report",
  "branch-comparison": "Branch Comparison",
};

export default function ReportPlaceholder() {
  const { slug } = useParams<{ slug: string }>();
  const title = (slug && titles[slug]) ?? "Report";

  return (
    <div>
      <PageHeader title={title} subtitle="This report will be implemented in an upcoming milestone." />
      <div className="bg-white border border-slate-200 rounded-lg">
        <EmptyState
          icon={FileBarChart}
          title="Report under construction"
          description={`The ${title} will populate once its backend module is implemented.`}
        />
      </div>
    </div>
  );
}