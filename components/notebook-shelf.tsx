"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { getAll, put } from "@/lib/ink/db"
import { createNotebook, createPage, type Notebook } from "@/lib/ink/model"
import { COVER_COLORS, COVER_STYLES, isLightColor, type CoverStyleId } from "@/lib/ink/notebook-covers"
import { NotebookCover } from "@/components/notebook-cover"

export function NotebookShelf() {
  const router = useRouter()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loaded, setLoaded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [coverStyle, setCoverStyle] = useState<CoverStyleId>(COVER_STYLES[0].id)
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0])

  useEffect(() => {
    getAll<Notebook>("notebooks").then((list) => {
      setNotebooks(list.sort((a, b) => a.order - b.order))
      setLoaded(true)
    })
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    const name = title.trim() || "Novo caderno"
    const order = notebooks.length ? Math.max(...notebooks.map((n) => n.order)) + 1 : 0
    const notebook = createNotebook(name, order, coverStyle, coverColor)
    const page = createPage(notebook.id, 0)
    await put("notebooks", notebook)
    await put("pages", page)
    router.push(`/notebooks/${notebook.id}`)
  }

  const cardBase: React.CSSProperties = {
    aspectRatio: "3 / 4",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    padding: 0,
    overflow: "hidden",
  }

  return (
    <div style={{ padding: "2rem", flex: 1 }}>
      <h1 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Meus cadernos</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
          maxWidth: 760,
        }}
      >
        {loaded &&
          notebooks.map((nb) => {
            const light = isLightColor(nb.coverColor || COVER_COLORS[0])
            return (
              <button
                key={nb.id}
                onClick={() => router.push(`/notebooks/${nb.id}`)}
                className="card"
                style={cardBase}
              >
                <div style={{ flex: 1, position: "relative" }}>
                  <NotebookCover coverStyle={nb.coverStyle || "brochura"} coverColor={nb.coverColor || COVER_COLORS[0]} />
                </div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    padding: "0.5rem",
                    background: nb.coverColor || COVER_COLORS[0],
                    color: light ? "#1b2430" : "#f4f6f8",
                    borderTop: "1px solid rgba(0,0,0,0.12)",
                  }}
                >
                  {nb.title}
                </span>
              </button>
            )
          })}

        {creating ? (
          <form
            onSubmit={handleCreate}
            className="card"
            style={{ ...cardBase, padding: "0.9rem", gap: "0.6rem", justifyContent: "center" }}
          >
            <input
              autoFocus
              placeholder="Nome do caderno"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", textAlign: "center" }}
            />

            <div style={{ display: "flex", justifyContent: "center", gap: "0.35rem" }}>
              {COVER_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCoverStyle(s.id)}
                  style={{
                    fontSize: "0.68rem",
                    padding: "0.25rem 0.4rem",
                    borderRadius: "0.4rem",
                    border: `1px solid ${coverStyle === s.id ? "var(--accent)" : "var(--border)"}`,
                    background: coverStyle === s.id ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent",
                    color: "var(--ink)",
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "0.35rem" }}>
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => setCoverColor(c)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: c,
                    border: coverColor === c ? "2px solid var(--accent)" : "1px solid var(--border)",
                    padding: 0,
                  }}
                />
              ))}
            </div>

            <button type="submit" className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
              Criar
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.75rem" }}
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            style={{
              ...cardBase,
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              border: "1px dashed var(--border)",
              background: "transparent",
              gap: "0.5rem",
            }}
          >
            <Plus size={24} />
            <span style={{ fontSize: "0.85rem" }}>Novo caderno</span>
          </button>
        )}
      </div>
    </div>
  )
}
