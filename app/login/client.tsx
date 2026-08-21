"use client"

import { useState, type FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Usuário ou senha incorretos.")
      return
    }

    router.push("/notebooks")
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.85rem" }}>
      <div style={{ display: "grid", gap: "0.3rem" }}>
        <label style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Usuário</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
        />
      </div>

      <div style={{ display: "grid", gap: "0.3rem" }}>
        <label style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--accent-strong)" }}>{error}</p>
      )}

      <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "0.4rem" }}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  )
}
