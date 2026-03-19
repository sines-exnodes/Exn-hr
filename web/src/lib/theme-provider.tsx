"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { themes, themeToCSS, type ThemeName } from "./design-tokens";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "green",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("green");

  useEffect(() => {
    const saved = localStorage.getItem("exn-hr-theme") as ThemeName | null;
    if (saved && saved in themes) {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const cssVars = themeToCSS(themes[theme]);
    for (const [key, value] of Object.entries(cssVars)) {
      root.style.setProperty(key, value);
    }
    root.setAttribute("data-theme", theme);
    localStorage.setItem("exn-hr-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "green" ? "dark-blue" : "green"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
