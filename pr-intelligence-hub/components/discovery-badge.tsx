import { cn } from "@/lib/utils";
import {
  DISCOVERY_STATUS_LABELS,
  type DiscoveryStatus,
} from "@/lib/domain/discovery";
import { REPRESENTATION_PURPOSES } from "@/lib/domain/representation-purpose";
import type { RepresentationType } from "@/lib/domain/opportunity";

export function DiscoveryStatusBadge({ status }: { status: DiscoveryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        status === "ai_found_needs_review" && "bg-blue-50 text-blue-700",
        (status === "reviewing" || status === "possible_duplicate") &&
          "bg-amber-50 text-amber-700",
        status === "approved" && "bg-emerald-50 text-emerald-700",
        (status === "rejected" ||
          status === "duplicate" ||
          status === "expired") &&
          "bg-slate-100 text-slate-600",
      )}
    >
      {DISCOVERY_STATUS_LABELS[status]}
    </span>
  );
}

export function RepresentationPurposeBadge({
  representationType,
}: {
  representationType: RepresentationType | null;
}) {
  if (!representationType) return null;
  const purpose = REPRESENTATION_PURPOSES[representationType];
  return (
    <span
      title={purpose.description}
      className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
    >
      Best for: {purpose.label}
    </span>
  );
}
