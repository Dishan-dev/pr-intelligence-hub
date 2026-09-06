import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ApplicationSidebar } from "@/components/application-sidebar";
import { createClient } from "@/lib/supabase/server";

async function AuthenticatedApplication({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 md:flex">
      <ApplicationSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}

function ApplicationShellFallback() {
  return <div className="min-h-screen bg-slate-50" aria-busy="true" />;
}

export default function ApplicationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<ApplicationShellFallback />}>
      <AuthenticatedApplication>{children}</AuthenticatedApplication>
    </Suspense>
  );
}
