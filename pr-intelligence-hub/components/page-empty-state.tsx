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
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 text-center">
      <span className="mb-4 grid size-10 place-items-center rounded-full bg-slate-800 text-slate-400">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

