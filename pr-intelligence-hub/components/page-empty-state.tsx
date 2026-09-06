import type { LucideIcon } from "lucide-react";

interface PageEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PageEmptyState({
  icon: Icon,
  title,
  description,
}: PageEmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 text-center">
      <span className="mb-4 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
