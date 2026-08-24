import { NotebookPen } from "lucide-react"
import { LoginForm } from "./client"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <ThemeToggle />
      </div>

      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 360,
          padding: "2.25rem 2rem",
          display: "grid",
          gap: "1.5rem",
        }}
      >
        <div style={{ display: "grid", gap: "0.4rem", justifyItems: "center", textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "0.85rem",
              background: "var(--accent)",
              color: "var(--accent-ink)",
              display: "grid",
              placeItems: "center",
              marginBottom: "0.35rem",
            }}
          >
            <NotebookPen size={22} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Caderno</h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            Seu espaço pessoal de anotações
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
