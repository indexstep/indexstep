"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "win11";

interface ThemeContextType {
  theme: Theme;
  themes: Theme[];
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const themes: Theme[] = ["light", "dark", "win11"];

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved && themes.includes(saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const toggleTheme = () => {
    const idx = themes.indexOf(theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, themes, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
