"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { NotebookPen, Plus } from "lucide-react"
import { getAll, put } from "@/lib/ink/db"
import { createNotebook, createPage, type Notebook } from "@/lib/ink/model"

export function NotebookShelf() {
  const router = useRouter()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loaded, setLoaded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")

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
    const notebook = createNotebook(name, order)
    const page = createPage(notebook.id, 0)
    await put("notebooks", notebook)
    await put("pages", page)
    router.push(`/notebooks/${notebook.id}`)
  }

  const cardBase: React.CSSProperties = {
    aspectRatio: "3 / 4",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    padding: "1rem",
    textAlign: "center",
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
          notebooks.map((nb) => (
            <button key={nb.id} onClick={() => router.push(`/notebooks/${nb.id}`)} className="card" style={cardBase}>
              <NotebookPen size={26} color="var(--accent)" />
              <span style={{ fontSize: "0.9rem" }}>{nb.title}</span>
            </button>
          ))}

        {creating ? (
          <form onSubmit={handleCreate} className="card" style={cardBase}>
            <input
              autoFocus
              placeholder="Nome do caderno"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (!title.trim()) setCreating(false)
              }}
              style={{ width: "100%", textAlign: "center" }}
            />
            <button type="submit" className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
              Criar
            </button>
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            style={{
              ...cardBase,
              color: "var(--muted)",
              border: "1px dashed var(--border)",
              background: "transparent",
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
