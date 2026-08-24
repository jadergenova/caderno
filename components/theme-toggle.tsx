"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

const STORAGE_KEY = "caderno-theme"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null)

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme")
    setTheme(current === "dark" ? "dark" : "light")
  }, [])

  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  if (theme === null) {
    return <div style={{ width: 32, height: 32 }} />
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      style={{
        display: "grid",
        placeItems: "center",
        width: 32,
        height: 32,
        borderRadius: "0.5rem",
        border: "none",
        background: "transparent",
        color: "var(--muted)",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
