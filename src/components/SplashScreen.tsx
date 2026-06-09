"use client";

import { useState, useEffect } from "react";
import { Scale } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"intro" | "exit">("intro");

  useEffect(() => {
    // Start exit animation after 4.5 seconds
    const exitTimer = setTimeout(() => setPhase("exit"), 4500);
    // Call onComplete after full animation (4.5s intro + 0.8s exit)
    const completeTimer = setTimeout(onComplete, 5300);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-bl from-primary via-primary-dark to-primary transition-opacity duration-700 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Logo */}
      <div className="relative mb-8 animate-splash-logo">
        <div className="w-24 h-24 bg-secondary/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-secondary/30">
          <Scale className="w-14 h-14 text-secondary" />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-3xl border-2 border-secondary/40 animate-splash-ring" />
      </div>

      {/* Brand Name */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 animate-splash-text">
        المنصة القانونية الجزائرية
      </h1>

      {/* Tagline */}
      <p className="text-lg text-gray-300 animate-splash-tagline">
        إدارة مكتبك القانوني <span className="text-secondary">بذكاء واحترافية</span>
      </p>

      {/* Loading bar */}
      <div className="mt-10 w-48 h-1 bg-white/10 rounded-full overflow-hidden animate-splash-tagline">
        <div className="h-full bg-secondary rounded-full animate-splash-bar" />
      </div>

      {/* Copyright & Developer */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2 animate-splash-copyright">
        <p className="text-xs text-white/40 tracking-wide">
          &copy; 2026 المنصة القانونية الجزائرية. جميع الحقوق محفوظة
        </p>
        <p className="text-xs text-secondary/60">
          تطوير: <span className="font-semibold text-secondary/80">بونمورة صالح الدين</span>
        </p>
      </div>
    </div>
  );
}
