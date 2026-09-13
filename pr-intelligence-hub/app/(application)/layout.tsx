import { Suspense } from "react";

import { ApplicationSidebar } from "@/components/application-sidebar";

function ApplicationShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-shell min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 md:flex">
      <ApplicationSidebar />
      <main className="min-w-0 flex-1 md:ml-60">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}

function ApplicationShellFallback() {
  return <div className="min-h-screen bg-slate-950" aria-busy="true" />;
}

export default function ApplicationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<ApplicationShellFallback />}>
      <ApplicationShell>{children}</ApplicationShell>
    </Suspense>
  );
}

