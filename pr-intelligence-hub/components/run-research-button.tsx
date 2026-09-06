"use client";
import { useActionState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { runResearch, type ResearchActionState } from "@/app/(application)/discoveries/research-actions";
import { Button } from "@/components/ui/button";
const initial: ResearchActionState = {};
export function RunResearchButton() { const [state, action, pending] = useActionState(runResearch, initial); return <div><form action={action}><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Search />}{pending ? "Research running…" : "Run research"}</Button></form>{state.message && <p className="mt-2 text-xs text-red-600">{state.message}</p>}</div>; }
