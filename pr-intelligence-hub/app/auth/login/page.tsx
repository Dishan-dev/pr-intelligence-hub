import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-slate-950 p-6 md:p-10">
      {/* Grid bg */}
      <div className="starter-grid absolute inset-0 opacity-40" aria-hidden="true" />
      {/* Glow */}
      <div
        className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.5) 0%, transparent 70%)", filter: "blur(60px)" }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

