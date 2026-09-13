"use client";

import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`loading-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      aria-hidden="true"
    >
      {/* Ambient glow blobs */}
      <div className="loading-blob loading-blob-1" />
      <div className="loading-blob loading-blob-2" />

      {/* Logo mark */}
      <div className="loading-logo-wrapper mb-8">
        <div className="loading-logo-ring" />
        <div className="loading-logo-inner">
          <span className="text-xl font-bold text-slate-950 tracking-tight">CS</span>
        </div>
      </div>

      {/* Brand name */}
      <p className="loading-brand mb-2 text-lg font-semibold tracking-[0.22em] text-white uppercase">
        CS PR HUB
      </p>
      <p className="loading-tagline mb-10 text-xs tracking-widest text-slate-400 uppercase">
        Public Relations Command Centre
      </p>

      {/* Progress bar */}
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}
