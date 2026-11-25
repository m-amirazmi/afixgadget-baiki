"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "../../../components/ui/button";

type ThemeSwitcherProps = {
  className?: string;
  variant?: "ghost" | "outline";
};

export function ThemeSwitcher({
  className,
  variant = "outline",
}: ThemeSwitcherProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDarkTheme(nextIsDark);
  }

  const nextTheme = isDarkTheme ? "light" : "dark";

  return (
    <Button
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={isDarkTheme}
      className={`size-11 ${className ?? ""}`}
      onClick={toggleTheme}
      size="icon"
      title={`Switch to ${nextTheme} theme`}
      type="button"
      variant={variant}
    >
      {isDarkTheme ? (
        <Sun aria-hidden="true" />
      ) : (
        <Moon aria-hidden="true" />
      )}
    </Button>
  );
}
