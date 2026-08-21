"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { getAllByIndex, put } from "@/lib/ink/db"
import { createPage, type Page } from "@/lib/ink/model"
import { InkCanvas } from "@/components/ink-canvas"

const navButtonStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 30,
  height: 30,
  borderRadius: "0.4rem",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--ink)",
}

export function NotebookEditor({ notebookId }: { notebookId: string }) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getAllByIndex<Page>("pages", "notebookId", notebookId).then((list) => {
      setPages(list.sort((a, b) => a.order - b.order))
      setLoaded(true)
    })
  }, [notebookId])

  async function addPage() {
    const order = pages.length ? Math.max(...pages.map((p) => p.order)) + 1 : 0
    const page = createPage(notebookId, order)
    await put("pages", page)
    setPages((prev) => [...prev, page])
    setPageIndex(pages.length)
  }

  if (!loaded) return null
  const currentPage = pages[pageIndex]

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1.25rem 1.5rem", minHeight: 0, gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={() => router.push("/notebooks")}
          style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.85rem", cursor: "pointer" }}
        >
          ← Estante
        </button>
        <div style={{ flex: 1 }} />
        <button disabled={pageIndex === 0} onClick={() => setPageIndex((i) => i - 1)} style={navButtonStyle}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          Página {pageIndex + 1} de {pages.length}
        </span>
        <button disabled={pageIndex >= pages.length - 1} onClick={() => setPageIndex((i) => i + 1)} style={navButtonStyle}>
          <ChevronRight size={18} />
        </button>
        <button onClick={addPage} style={navButtonStyle} aria-label="Nova página">
          <Plus size={18} />
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, boxShadow: "0 20px 45px -20px var(--shadow)", borderRadius: "0.9rem" }}>
        {currentPage && <InkCanvas key={currentPage.id} pageId={currentPage.id} />}
      </div>
    </div>
  )
}
