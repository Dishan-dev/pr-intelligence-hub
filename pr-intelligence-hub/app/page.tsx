import Link from "next/link";
import { ArrowRight, CalendarDays, MessageSquareText, Radio, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white relative">
      {/* Background grid */}
      <div className="starter-grid absolute inset-0 opacity-50" aria-hidden="true" />

      {/* Hero ambient glow */}
      <div className="hero-glow" aria-hidden="true" />

      {/* Secondary accent blob */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[400px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(99,102,241,0.5) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="starter-reveal flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative grid size-10 place-items-center rounded-lg overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 transition-shadow group-hover:shadow-emerald-500/40">
              <span className="text-sm font-bold text-slate-950 tracking-tight">CS</span>
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase text-white/80 group-hover:text-white transition-colors">CS PR HUB</span>
          </Link>
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Go to dashboard <ArrowRight className="size-3" />
          </Link>
        </header>

        {/* Hero Section */}
        <section className="flex flex-1 items-center py-16 lg:py-20">
          <div className="grid w-full gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

            {/* Left — copy */}
            <div className="starter-reveal max-w-2xl">
              {/* Pill badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 backdrop-blur-sm">
                <Sparkles className="size-3.5 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Public relations command centre
                </span>
              </div>

              <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4rem]">
                <span className="gradient-text">Turn the right moment</span>{" "}
                <span className="text-white">into the right conversation.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">
                A focused workspace for discovering opportunities, building media relationships, and planning outreach around the moments that matter.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  id="cta-enter-hub"
                  className="btn-primary-shine inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20"
                >
                  Enter CS PR HUB <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-10 flex flex-wrap items-center gap-6">
                {[
                  { value: "100+", label: "Media contacts" },
                  { value: "50+", label: "Outreach templates" },
                  { value: "200+", label: "Calendar moments" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-xl font-bold text-white">{s.value}</span>
                    <span className="text-xs text-slate-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — feature cards */}
            <div className="starter-reveal starter-reveal-delay grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <Feature
                icon={Radio}
                label="Discover"
                detail="Find media and external representation leads with AI-powered research."
                accent="emerald"
              />
              <Feature
                icon={MessageSquareText}
                label="Connect"
                detail="Use ready outreach templates for every channel — email, Instagram, WhatsApp."
                accent="violet"
              />
              <Feature
                icon={CalendarDays}
                label="Plan"
                detail="Align stories with SDG and cultural moments that resonate."
                accent="amber"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="starter-reveal starter-reveal-late flex items-center justify-between border-t border-white/[0.06] pt-5 text-xs text-slate-600">
          <span>Built for purposeful outreach.</span>
          <span className="text-slate-700">CS PR HUB © 2025</span>
        </footer>
      </div>
    </main>
  );
}

const accentMap = {
  emerald: {
    icon: "text-emerald-400",
    dot: "bg-emerald-400",
    glow: "rgba(52,211,153,0.08)",
  },
  violet: {
    icon: "text-violet-400",
    dot: "bg-violet-400",
    glow: "rgba(139,92,246,0.08)",
  },
  amber: {
    icon: "text-amber-400",
    dot: "bg-amber-400",
    glow: "rgba(251,191,36,0.08)",
  },
};

function Feature({
  icon: Icon,
  label,
  detail,
  accent,
}: {
  icon: typeof Radio;
  label: string;
  detail: string;
  accent: keyof typeof accentMap;
}) {
  const colors = accentMap[accent];
  return (
    <div
      className="feature-card rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm"
      style={{ "--feature-glow": colors.glow } as React.CSSProperties}
    >
      <div className={`inline-flex size-10 items-center justify-center rounded-lg bg-white/[0.06] ${colors.icon}`}>
        <Icon className="size-5" />
      </div>
      <p className="mt-5 text-sm font-semibold text-white">{label}</p>
      <p className="mt-1.5 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}

