"use client";

import { archiveOpportunity, deleteOpportunity } from "@/app/(application)/opportunities/actions";
import { Button } from "@/components/ui/button";

export function OpportunityLifecycleActions({ id, archived }: { id: string; archived: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {!archived && <form action={archiveOpportunity}><input type="hidden" name="id" value={id} /><Button type="submit" variant="outline">Archive</Button></form>}
      <form action={deleteOpportunity} onSubmit={(event) => { if (!window.confirm("Delete this opportunity permanently? This cannot be undone.")) event.preventDefault(); }}>
        <input type="hidden" name="id" value={id} /><Button type="submit" variant="destructive">Delete</Button>
      </form>
    </div>
  );
}
