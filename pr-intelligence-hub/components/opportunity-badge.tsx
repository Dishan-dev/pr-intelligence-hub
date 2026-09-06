import { cn } from "@/lib/utils";
import { OPPORTUNITY_PRIORITY_LABELS, OPPORTUNITY_STATUS_LABELS, type OpportunityPriority, type OpportunityStatus } from "@/lib/domain/opportunity";

export function OpportunityStatusBadge({ status }: { status: OpportunityStatus }) {
  return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{OPPORTUNITY_STATUS_LABELS[status]}</span>;
}

export function OpportunityPriorityBadge({ priority }: { priority: OpportunityPriority | null }) {
  if (!priority) return <span className="text-sm text-slate-400">—</span>;
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", priority === "critical" && "bg-red-50 text-red-700", priority === "high" && "bg-amber-50 text-amber-700", priority === "medium" && "bg-blue-50 text-blue-700", priority === "low" && "bg-slate-100 text-slate-600")}>{OPPORTUNITY_PRIORITY_LABELS[priority]}</span>;
}
