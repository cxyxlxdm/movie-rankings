"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={theme === "dark" ? "切换白天模式" : "切换夜间模式"}
      title={theme === "dark" ? "切换白天模式" : "切换夜间模式"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
