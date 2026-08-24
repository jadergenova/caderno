import { NotebookPen } from "lucide-react"
import { auth } from "@/lib/auth"
import { SignOutButton } from "@/components/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1.25rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <NotebookPen size={18} color="var(--accent)" />
          <span className="font-display" style={{ fontSize: "1.05rem" }}>
            Caderno
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <ThemeToggle />
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{session?.user?.name}</span>
          <SignOutButton />
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", minHeight: 0 }}>{children}</main>
    </div>
  )
}
