"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({
  theme: "light",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getTimeBasedTheme(): Theme {
  const h = new Date().getHours();
  // 早上 7 点 ~ 晚上 9 点 → 白天模式
  return h >= 7 && h < 21 ? "light" : "dark";
}

function resolveTheme(): Theme {
  // 优先 localStorage
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  // 其次时间自动
  return getTimeBasedTheme();
}

function applyTheme(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = resolveTheme();
    setTheme(t);
    applyTheme(t);
    setMounted(true);

    // 每小时检查一次时间自动切换
    const interval = setInterval(() => {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return; // 手动模式不覆盖
      const t = getTimeBasedTheme();
      setTheme(t);
      applyTheme(t);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      applyTheme(next);
      return next;
    });
  }, []);

  // 防止 hydration 闪烁
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
