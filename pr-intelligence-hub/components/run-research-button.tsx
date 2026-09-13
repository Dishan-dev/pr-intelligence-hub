"use client";
import { useActionState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { runResearch, type ResearchActionState } from "@/app/(application)/discoveries/research-actions";
import { Button } from "@/components/ui/button";
const initial: ResearchActionState = {};
export function RunResearchButton() {
  const [state, action, pending] = useActionState(runResearch, initial);
  return (
    <div className="flex flex-col items-start gap-2">
      <form action={action}>
        <Button
          type="submit"
          disabled={pending}
          className="bg-emerald-500 font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : (
            <Search className="mr-2 size-4" />
          )}
          {pending ? "Research running..." : "Run research"}
        </Button>
      </form>
      {state.message && (
        <p className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
          {state.message}
        </p>
      )}
    </div>
  );
}
