"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      aria-label="Sair"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "transparent",
        border: "none",
        color: "var(--muted)",
        fontSize: "0.85rem",
      }}
    >
      <LogOut size={16} />
      Sair
    </button>
  )
}
