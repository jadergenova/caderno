"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, ChevronLeft, ChevronRight, Plus } from "lucide-react"
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
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const bookmarksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAllByIndex<Page>("pages", "notebookId", notebookId).then((list) => {
      setPages(list.sort((a, b) => a.order - b.order))
      setLoaded(true)
    })
  }, [notebookId])

  useEffect(() => {
    if (!bookmarksOpen) return
    function onPointerDown(e: PointerEvent) {
      if (bookmarksRef.current && !bookmarksRef.current.contains(e.target as Node)) {
        setBookmarksOpen(false)
      }
    }
    window.addEventListener("pointerdown", onPointerDown)
    return () => window.removeEventListener("pointerdown", onPointerDown)
  }, [bookmarksOpen])

  async function addPage() {
    const order = pages.length ? Math.max(...pages.map((p) => p.order)) + 1 : 0
    const page = createPage(notebookId, order)
    await put("pages", page)
    setPages((prev) => [...prev, page])
    setPageIndex(pages.length)
  }

  async function toggleBookmark(index: number) {
    const page = pages[index]
    const updated = { ...page, bookmarked: !page.bookmarked, updatedAt: Date.now() }
    await put("pages", updated)
    setPages((prev) => prev.map((p, i) => (i === index ? updated : p)))
  }

  if (!loaded) return null
  const currentPage = pages[pageIndex]
  const bookmarkedPages = pages
    .map((p, i) => ({ page: p, index: i }))
    .filter((entry) => entry.page.bookmarked)

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
        <button
          onClick={() => currentPage && toggleBookmark(pageIndex)}
          aria-label={currentPage?.bookmarked ? "Remover marcador desta página" : "Marcar esta página"}
          style={{
            ...navButtonStyle,
            color: currentPage?.bookmarked ? "var(--accent)" : "var(--ink)",
          }}
        >
          <Bookmark size={16} fill={currentPage?.bookmarked ? "currentColor" : "none"} />
        </button>
        <div ref={bookmarksRef} style={{ position: "relative" }}>
          <button
            onClick={() => setBookmarksOpen((v) => !v)}
            style={navButtonStyle}
            aria-label="Ver páginas marcadas"
          >
            <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>{bookmarkedPages.length}</span>
          </button>
          {bookmarksOpen && (
            <div
              className="card"
              style={{
                position: "absolute",
                top: "2.25rem",
                right: 0,
                minWidth: 160,
                padding: "0.5rem",
                display: "grid",
                gap: "0.2rem",
                zIndex: 10,
              }}
            >
              {bookmarkedPages.length === 0 && (
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", padding: "0.3rem 0.4rem" }}>
                  Nenhuma página marcada
                </span>
              )}
              {bookmarkedPages.map(({ index }) => (
                <button
                  key={index}
                  onClick={() => {
                    setPageIndex(index)
                    setBookmarksOpen(false)
                  }}
                  style={{
                    fontSize: "0.8rem",
                    textAlign: "left",
                    padding: "0.35rem 0.5rem",
                    borderRadius: "0.4rem",
                    border: "none",
                    background: index === pageIndex ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent",
                    color: "var(--ink)",
                  }}
                >
                  Página {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
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
