"use client"

import { useEffect, useRef, useState } from "react"
import { Eraser } from "lucide-react"
import { attachInkEngine, type InkEngineHandle } from "@/lib/ink/engine"

const COLORS = [
  { name: "Tinta", value: "#2a2420" },
  { name: "Azul", value: "#2f4b7c" },
  { name: "Vermelho", value: "#a63b32" },
  { name: "Verde", value: "#3d6b4f" },
]

export function InkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<InkEngineHandle | null>(null)
  const [color, setColor] = useState(COLORS[0].value)

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
    // Engine is attached once; color/width updates go through the handle below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    engineRef.current?.setColor(color)
  }, [color])

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        className="paper-ruled"
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
          borderRadius: "0.9rem",
          display: "block",
        }}
      />

      <div
        className="card"
        style={{
          position: "absolute",
          bottom: "1.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          padding: "0.5rem 0.75rem",
        }}
      >
        {COLORS.map((c) => (
          <button
            key={c.value}
            aria-label={c.name}
            onClick={() => setColor(c.value)}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: c.value,
              border: color === c.value ? "2px solid var(--accent)" : "2px solid transparent",
              padding: 0,
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
          }}
        >
          <Eraser size={18} />
        </button>
      </div>
    </div>
  )
}
