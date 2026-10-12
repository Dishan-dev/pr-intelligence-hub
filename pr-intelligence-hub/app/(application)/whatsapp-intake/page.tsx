import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "WhatsApp Intake" };
export const dynamic = "force-dynamic";

export default async function WhatsAppIntakePage() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: rows, error } = await admin.from("whatsapp_intake_messages")
    .select("sender_phone,processing_status,discovery_id,created_at")
    .order("created_at", { ascending: false }).limit(2000);
  if (error) return <p className="text-rose-400">WhatsApp intake is not configured yet. Apply the migration before opening this page.</p>;

  const { data: members } = await admin.from("whatsapp_member_links").select("phone_number,member_name");
  const memberNames = new Map((members ?? []).map((member) => [member.phone_number, member.member_name]));
  const discoveryIds = [...new Set((rows ?? []).map((row) => row.discovery_id).filter((id): id is string => Boolean(id)))];
  const statuses = new Map<string, string>();
  for (let i = 0; i < discoveryIds.length; i += 100) {
    const { data: discoveries } = await admin.from("discovered_opportunities")
      .select("id,discovery_status").in("id", discoveryIds.slice(i, i + 100));
    for (const discovery of discoveries ?? []) statuses.set(discovery.id, discovery.discovery_status);
  }
  const stats = new Map<string, { name: string; submitted: number; approved: number; failed: number }>();
  for (const row of rows ?? []) {
    const name = memberNames.get(row.sender_phone) ?? "Unlinked member";
    const key = memberNames.has(row.sender_phone) ? row.sender_phone : "unlinked";
    const current = stats.get(key) ?? { name, submitted: 0, approved: 0, failed: 0 };
    if (row.processing_status === "processed") current.submitted++;
    if (row.processing_status === "processed" && row.discovery_id && statuses.get(row.discovery_id) === "approved") current.approved++;
    if (row.processing_status === "failed") current.failed++;
    stats.set(key, current);
  }
  const leaders = [...stats.values()].sort((a, b) => b.approved - a.approved || b.submitted - a.submitted);
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">WhatsApp Opportunity Intake</h1>
        <p className="mt-2 text-sm text-slate-400">Submission credit and review outcomes. Counts are based on the latest 2,000 intake records.</p>
        <Link href="/discoveries" className="mt-3 inline-block text-sm text-emerald-400 hover:underline">Open discovery inbox →</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[["Messages received", (rows ?? []).length], ["New discoveries", (rows ?? []).filter((r) => r.processing_status === "processed").length], ["Processing failures", (rows ?? []).filter((r) => r.processing_status === "failed").length]].map(([label, count]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{count}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400"><tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Unique submissions</th><th className="px-4 py-3">Approved</th><th className="px-4 py-3">Failed</th></tr></thead>
          <tbody>{leaders.map((member) => <tr key={member.name} className="border-b border-slate-800/60">
            <td className="px-4 py-3 font-medium text-slate-100">{member.name}</td>
            <td className="px-4 py-3">{member.submitted}</td><td className="px-4 py-3">{member.approved}</td><td className="px-4 py-3">{member.failed}</td>
          </tr>)}</tbody>
        </table>
        {leaders.length === 0 && <p className="p-5 text-sm text-slate-400">No WhatsApp submissions yet. Connect Meta's test number to begin.</p>}
      </div>
      <p className="text-xs text-slate-500">Private operational view. Do not share member attribution without consent.</p>
    </section>
  );
}
