"use client"

import { useEffect, useRef, useState } from "react"
import { Eraser, LayoutGrid } from "lucide-react"
import { attachInkEngine, type InkEngineHandle } from "@/lib/ink/engine"
import {
  PAGE_TEMPLATES,
  PAPER_PRESETS,
  pageBackgroundStyle,
  type PageTemplate,
  type PaperPreset,
} from "@/lib/ink/page-background"

const INK_COLORS = [
  { name: "Tinta", value: "#2a2420" },
  { name: "Azul", value: "#2f4b7c" },
  { name: "Vermelho", value: "#a63b32" },
  { name: "Verde", value: "#3d6b4f" },
  { name: "Roxo", value: "#6b4c8a" },
  { name: "Laranja", value: "#c1672f" },
  { name: "Rosa", value: "#b5537a" },
  { name: "Creme", value: "#f7f1e3" },
]

export function InkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<InkEngineHandle | null>(null)
  const [color, setColor] = useState(INK_COLORS[0].value)
  const [paperPreset, setPaperPreset] = useState<PaperPreset>(PAPER_PRESETS[0])
  const [pageTemplate, setPageTemplate] = useState<PageTemplate>("ruled")
  const [pageMenuOpen, setPageMenuOpen] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.max(1, Math.round(rect.width * dpr))
      canvas!.height = Math.max(1, Math.round(rect.height * dpr))
      ctx!.scale(dpr, dpr)
    }

    resize()
    const engine = attachInkEngine(canvas, { color, lineWidth: 2.5 })
    engineRef.current = engine

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      observer.disconnect()
      engine.destroy()
    }
    // Engine is attached once; color updates go through the handle below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    engineRef.current?.setColor(color)
  }, [color])

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          ...pageBackgroundStyle(paperPreset, pageTemplate),
          width: "100%",
          height: "100%",
          touchAction: "none",
          borderRadius: "0.9rem",
          display: "block",
        }}
      />

      {/* Page settings */}
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        <button
          aria-label="Configurações da página"
          onClick={() => setPageMenuOpen((v) => !v)}
          className="card"
          style={{
            display: "grid",
            placeItems: "center",
            width: 38,
            height: 38,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--muted)",
          }}
        >
          <LayoutGrid size={17} />
        </button>

        {pageMenuOpen && (
          <div
            className="card"
            style={{
              position: "absolute",
              top: "2.75rem",
              right: 0,
              width: 220,
              padding: "0.9rem",
              display: "grid",
              gap: "0.9rem",
            }}
          >
            <div style={{ display: "grid", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Modelo de página</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                {PAGE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPageTemplate(t.id)}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.5rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${pageTemplate === t.id ? "var(--accent)" : "var(--border)"}`,
                      background: pageTemplate === t.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                      color: "var(--ink)",
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Cor do papel</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {PAPER_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    aria-label={p.name}
                    onClick={() => setPaperPreset(p)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: p.paperColor,
                      border: paperPreset.id === p.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ink tools */}
      <div
        className="card"
        style={{
          position: "absolute",
          bottom: "1.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          maxWidth: "calc(100% - 2rem)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {INK_COLORS.map((c) => (
          <button
            key={c.value}
            aria-label={c.name}
            onClick={() => setColor(c.value)}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: c.value,
              border: color === c.value ? "2px solid var(--accent)" : "2px solid transparent",
              boxShadow: "0 0 0 1px var(--border)",
              padding: 0,
              flexShrink: 0,
            }}
          />
        ))}
        <div style={{ width: 1, height: 24, background: "var(--border)" }} />
        <button
          aria-label="Limpar página"
          onClick={() => engineRef.current?.clear()}
          style={{
            display: "grid",
            placeItems: "center",
            width: 32,
            height: 32,
            borderRadius: "0.5rem",
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            flexShrink: 0,
          }}
        >
          <Eraser size={18} />
        </button>
      </div>
    </div>
  )
}
