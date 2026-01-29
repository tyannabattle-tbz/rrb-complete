import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

interface ThemeToggleProps {
  onThemeChange?: (theme: Theme) => void;
}

export default function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      <Button
        onClick={() => handleThemeChange("light")}
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        className="gap-1"
        title="Light theme"
      >
        <Sun size={16} />
      </Button>

      <Button
        onClick={() => handleThemeChange("dark")}
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        className="gap-1"
        title="Dark theme"
      >
        <Moon size={16} />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        onClick={() => handleThemeChange("system")}
        variant={theme === "system" ? "default" : "ghost"}
        size="sm"
        className="gap-1"
        title="System theme"
      >
        <span className="text-xs">Auto</span>
      </Button>
    </div>
  );
}
