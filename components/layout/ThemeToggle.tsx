"use client";

import { useState, useEffect, useCallback } from "react";
import { Lightbulb } from "lucide-react";

export default function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const syncThemeState = useCallback(() => {
    try {
      const savedTheme = localStorage.getItem("staynest-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const currentDark = savedTheme ? savedTheme === "dark" : prefersDark;

      setIsDark(currentDark);
      if (currentDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    syncThemeState();

    window.addEventListener("theme-change", syncThemeState);
    window.addEventListener("storage", syncThemeState);

    return () => {
      window.removeEventListener("theme-change", syncThemeState);
      window.removeEventListener("storage", syncThemeState);
    };
  }, [syncThemeState]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    // Apply smooth animation class temporarily
    document.documentElement.classList.add("theme-transition");

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("staynest-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("staynest-theme", "light");
    }

    window.dispatchEvent(new Event("theme-change"));

    // Remove transition class after animation finishes so regular interactions are crisp
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 350);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className={`p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className || ""}`}
        aria-label="Toggle theme"
        suppressHydrationWarning
      >
        <Lightbulb className="w-4 h-4 text-gray-400" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      className={`p-2 rounded-xl transition-all duration-300 relative group flex items-center justify-center ${
        isDark
          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 shadow-sm"
          : "text-gray-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50/80 dark:hover:bg-slate-800 border border-transparent"
      } ${className || ""}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Dark / Light mode"
    >
      <Lightbulb
        className={`w-4 h-4 transition-all duration-300 ${
          isDark
            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110 rotate-0"
            : "text-gray-600 dark:text-slate-300 group-hover:text-amber-500 group-hover:rotate-12"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
