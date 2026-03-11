"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark";

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
    const initial = saved ?? "dark";
    setMode(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setReady(true);
  }, []);

  function toggleTheme() {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("theme-mode", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  if (!ready) return null;

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-5 right-5 z-[60] p-3 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-lg hover:shadow-xl transition-all"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {mode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
