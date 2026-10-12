import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Submit Opportunity" };

async function submitOpportunity(formData: FormData) {
  "use server";
  const value = (key: string, max = 300) => String(formData.get(key) ?? "").trim().slice(0, max);
  const submitter = value("submitter", 120);
  const title = value("title");
  const organization = value("organization");
  const description = value("description", 3000);
  const link = value("link", 1000);
  if (!submitter || !title || !description) redirect("/submit-opportunity?error=required");
  if (link) {
    try { const url = new URL(link); if (!["https:", "http:"].includes(url.protocol)) throw new Error(); }
    catch { redirect("/submit-opportunity?error=link"); }
  }
  const { error } = await createAdminClient().from("discovered_opportunities").insert({
    title,
    organization_name: organization || null,
    description,
    event_url: link || null,
    source_url: link || null,
    source_name: "Member form submission",
    discovery_status: "new",
    research_notes: `Submitted through public member form. Claimed submitter: ${submitter}. Identity not verified. Review before approval.`,
  });
  if (error) {
    console.error("Member opportunity submission failed", error);
    redirect("/submit-opportunity?error=save");
  }
  redirect("/submit-opportunity?success=1");
}

export default async function SubmitOpportunityPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const params = await searchParams;
  const input = "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none";
  return <section className="mx-auto max-w-2xl space-y-6">
    <div><h1 className="text-3xl font-semibold text-white">Submit an opportunity</h1><p className="mt-2 text-sm text-slate-400">Found an event, partnership, media opportunity or external representation? Share it with the PR team for review.</p></div>
    {params.success === "1" && <div role="status" className="rounded-lg border border-emerald-700 bg-emerald-950 p-4 text-sm text-emerald-200">Opportunity submitted! It is now in the Discoveries inbox for review.</div>}
    {params.error && <div role="alert" className="rounded-lg border border-rose-700 bg-rose-950 p-4 text-sm text-rose-200">{params.error === "required" ? "Please enter your name, a title and description." : params.error === "link" ? "Enter a valid http or https link." : "Could not save the opportunity. Please try again or contact an admin."}</div>}
    <form action={submitOpportunity} className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
      <div><label htmlFor="submitter" className="text-sm font-medium text-slate-200">Your name *</label><input id="submitter" name="submitter" required maxLength={120} className={input} placeholder="Name of the submitting PR member" /></div>
      <div><label htmlFor="title" className="text-sm font-medium text-slate-200">Opportunity title *</label><input id="title" name="title" required maxLength={300} className={input} placeholder="e.g. Youth Leadership Summit 2026" /></div>
      <div><label htmlFor="organization" className="text-sm font-medium text-slate-200">Organization</label><input id="organization" name="organization" maxLength={300} className={input} placeholder="Who is organizing it?" /></div>
      <div><label htmlFor="link" className="text-sm font-medium text-slate-200">Opportunity link</label><input id="link" name="link" type="url" maxLength={1000} className={input} placeholder="https://..." /></div>
      <div><label htmlFor="description" className="text-sm font-medium text-slate-200">Details or copied WhatsApp message *</label><textarea id="description" name="description" required maxLength={3000} rows={7} className={input} placeholder="Paste the message, explain the opportunity, and include dates or deadlines if known." /></div>
      <p className="text-xs text-slate-400">Submissions are reviewed before approval. Names entered here are not verified.</p>
      <button type="submit" className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">Submit for review</button>
    </form>
    <Link href="/discoveries" className="inline-block text-sm text-emerald-400 hover:underline">View Discoveries →</Link>
  </section>;
}
