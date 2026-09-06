import { cn } from "@/lib/utils";
import { DISCOVERY_STATUS_LABELS, type DiscoveryStatus } from "@/lib/domain/discovery";

export function DiscoveryStatusBadge({ status }: { status: DiscoveryStatus }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", status === "new" && "bg-blue-50 text-blue-700", status === "reviewing" && "bg-amber-50 text-amber-700", status === "approved" && "bg-emerald-50 text-emerald-700", (status === "rejected" || status === "duplicate" || status === "expired") && "bg-slate-100 text-slate-600")}>{DISCOVERY_STATUS_LABELS[status]}</span>;
}
