"use client"

import { useEffect, useRef, useState } from "react"
import { Eraser, ImagePlus, LayoutGrid, MousePointer2, Pen, Type } from "lucide-react"
import { attachInkEngine, renderStroke, type InkEngineHandle } from "@/lib/ink/engine"
import {
  PAGE_TEMPLATES,
  PAPER_PRESETS,
  pageBackgroundStyle,
  type PageTemplate,
  type PaperPreset,
} from "@/lib/ink/page-background"
import { get, getAllByIndex, put, remove } from "@/lib/ink/db"
import {
  createAsset,
  createImageObject,
  createStroke,
  createTextBox,
  type Asset,
  type ImageObject,
  type Page,
  type Stroke,
  type TextBox,
} from "@/lib/ink/model"
import { TextBoxView } from "@/components/text-box"
import { ImageObjectView } from "@/components/image-object"

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

type Tool = "pen" | "select"

export function InkCanvas({ pageId }: { pageId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<InkEngineHandle | null>(null)
  const strokesRef = useRef<Stroke[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [color, setColor] = useState(INK_COLORS[0].value)
  const colorRef = useRef(color)
  colorRef.current = color

  const [tool, setTool] = useState<Tool>("pen")
  const [fingerDrawing, setFingerDrawing] = useState(false)
  const fingerDrawingRef = useRef(fingerDrawing)
  fingerDrawingRef.current = fingerDrawing
  const [paperPreset, setPaperPreset] = useState<PaperPreset>(PAPER_PRESETS[0])
  const [pageTemplate, setPageTemplate] = useState<PageTemplate>("ruled")
  const [pageMenuOpen, setPageMenuOpen] = useState(false)
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([])
  const [images, setImages] = useState<{ obj: ImageObject; url: string }[]>([])
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null)

  // Load the page's saved settings, strokes, text boxes and images once.
  useEffect(() => {
    let cancelled = false

    async function load() {
      const page = await get<Page>("pages", pageId)
      if (page && !cancelled) {
        const preset = PAPER_PRESETS.find((p) => p.id === page.paperPresetId)
        if (preset) setPaperPreset(preset)
        setPageTemplate((page.pageTemplate as PageTemplate) || "ruled")
      }

      const [strokes, boxes, imageObjs] = await Promise.all([
        getAllByIndex<Stroke>("strokes", "pageId", pageId),
        getAllByIndex<TextBox>("textboxes", "pageId", pageId),
        getAllByIndex<ImageObject>("images", "pageId", pageId),
      ])
      if (cancelled) return

      strokesRef.current = strokes
      setTextBoxes(boxes)

      const withUrls = await Promise.all(
        imageObjs.map(async (obj) => {
          const asset = await get<Asset>("assets", obj.assetId)
          return asset ? { obj, url: URL.createObjectURL(asset.blob) } : null
        })
      )
      if (!cancelled) setImages(withUrls.filter((x): x is { obj: ImageObject; url: string } => x !== null))

      replayAll()
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  // Revoke image object URLs when they're replaced or the page unmounts.
  useEffect(() => {
    return () => {
      images.forEach((i) => URL.revokeObjectURL(i.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function replayAll() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const s of strokesRef.current) {
      renderStroke(ctx, s.points, s.color, s.lineWidth)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    let lastWidth = 0
    let lastHeight = 0

    // Ignores transitional zero/near-zero layout passes (e.g. before the
    // flex chain settles on first mount) and no-ops when the size hasn't
    // actually changed, since setting canvas.width/height itself can
    // trigger another ResizeObserver callback.
    function applySize(cssWidth: number, cssHeight: number) {
      if (cssWidth < 2 || cssHeight < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(cssWidth * dpr)
      const h = Math.round(cssHeight * dpr)
      if (w === lastWidth && h === lastHeight) return
      lastWidth = w
      lastHeight = h
      canvas!.width = w
      canvas!.height = h
      ctx!.scale(dpr, dpr)
      replayAll()
    }

    const initialRect = canvas.getBoundingClientRect()
    applySize(initialRect.width, initialRect.height)

    const engine = attachInkEngine(canvas, {
      color: colorRef.current,
      lineWidth: 2.5,
      allowFingerDrawing: fingerDrawingRef.current,
      onStrokeEnd: (points) => {
        const stroke = createStroke(pageId, colorRef.current, 2.5, points)
        strokesRef.current = [...strokesRef.current, stroke]
        put("strokes", stroke)
      },
    })
    engineRef.current = engine

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const boxSize = entry.contentBoxSize
      const box = Array.isArray(boxSize) ? boxSize[0] : boxSize
      if (box) applySize(box.inlineSize, box.blockSize)
      else applySize(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(canvas)

    return () => {
      observer.disconnect()
      engine.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  useEffect(() => {
    engineRef.current?.setColor(color)
  }, [color])

  useEffect(() => {
    engineRef.current?.setAllowFingerDrawing(fingerDrawing)
  }, [fingerDrawing])

  function savePageSettings(patch: Partial<Page>) {
    get<Page>("pages", pageId).then((page) => {
      if (page) put("pages", { ...page, ...patch, updatedAt: Date.now() })
    })
  }

  function updateTextBox(id: string, patch: Partial<TextBox>) {
    setTextBoxes((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function commitTextBox(id: string) {
    setTextBoxes((prev) => {
      const box = prev.find((t) => t.id === id)
      if (box) put("textboxes", { ...box, updatedAt: Date.now() })
      return prev
    })
  }

  function deleteTextBox(id: string) {
    setTextBoxes((prev) => prev.filter((t) => t.id !== id))
    remove("textboxes", id)
  }

  function addTextBox() {
    const n = textBoxes.length
    const box = createTextBox(pageId, 40 + (n % 5) * 24, 40 + (n % 5) * 24)
    setTextBoxes((prev) => [...prev, box])
    put("textboxes", box)
    setLastCreatedId(box.id)
    setTool("select")
  }

  function updateImage(id: string, patch: Partial<ImageObject>) {
    setImages((prev) => prev.map((i) => (i.obj.id === id ? { ...i, obj: { ...i.obj, ...patch } } : i)))
  }

  function commitImage(id: string) {
    setImages((prev) => {
      const entry = prev.find((i) => i.obj.id === id)
      if (entry) put("images", { ...entry.obj, updatedAt: Date.now() })
      return prev
    })
  }

  function deleteImage(id: string) {
    setImages((prev) => {
      const entry = prev.find((i) => i.obj.id === id)
      if (entry) URL.revokeObjectURL(entry.url)
      return prev.filter((i) => i.obj.id !== id)
    })
    remove("images", id)
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const bitmap = await createImageBitmap(file)
    const maxWidth = 240
    const scale = Math.min(1, maxWidth / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const asset = createAsset(file)
    await put("assets", asset)

    const n = images.length
    const obj = createImageObject(pageId, asset.id, 60 + (n % 4) * 30, 60 + (n % 4) * 30, width, height)
    await put("images", obj)

    setImages((prev) => [...prev, { obj, url: URL.createObjectURL(file) }])
    setTool("select")
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "0.9rem",
        overflow: "hidden",
        ...pageBackgroundStyle(paperPreset, pageTemplate),
      }}
    >
      {images.map(({ obj, url }) => (
        <ImageObjectView
          key={obj.id}
          image={obj}
          src={url}
          interactive={tool === "select"}
          onChange={updateImage}
          onCommit={commitImage}
          onDelete={deleteImage}
        />
      ))}

      {textBoxes.map((tb) => (
        <TextBoxView
          key={tb.id}
          textBox={tb}
          interactive={tool === "select"}
          autoFocus={tb.id === lastCreatedId}
          onChange={updateTextBox}
          onCommit={commitTextBox}
          onDelete={deleteTextBox}
        />
      ))}

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
          touchAction: "none",
          pointerEvents: tool === "pen" ? "auto" : "none",
        }}
      />

      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelected} style={{ display: "none" }} />

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
              zIndex: 10,
            }}
          >
            <div style={{ display: "grid", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Modelo de página</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                {PAGE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setPageTemplate(t.id)
                      savePageSettings({ pageTemplate: t.id })
                    }}
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
                    onClick={() => {
                      setPaperPreset(p)
                      savePageSettings({ paperPresetId: p.id })
                    }}
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

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                color: "var(--ink)",
                cursor: "pointer",
                paddingTop: "0.2rem",
                borderTop: "1px solid var(--border)",
              }}
            >
              <span>
                Desenhar com o dedo
                <br />
                <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>sem caneta</span>
              </span>
              <input
                type="checkbox"
                checked={fingerDrawing}
                onChange={(e) => setFingerDrawing(e.target.checked)}
                style={{ width: "auto" }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Tools */}
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
        <button
          aria-label="Caneta"
          onClick={() => setTool("pen")}
          style={toolButtonStyle(tool === "pen")}
        >
          <Pen size={17} />
        </button>
        <button
          aria-label="Selecionar"
          onClick={() => setTool("select")}
          style={toolButtonStyle(tool === "select")}
        >
          <MousePointer2 size={17} />
        </button>
        <button aria-label="Adicionar texto" onClick={addTextBox} style={toolButtonStyle(false)}>
          <Type size={17} />
        </button>
        <button
          aria-label="Adicionar foto"
          onClick={() => fileInputRef.current?.click()}
          style={toolButtonStyle(false)}
        >
          <ImagePlus size={17} />
        </button>

        <div style={{ width: 1, height: 24, background: "var(--border)" }} />

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
          onClick={() => {
            engineRef.current?.clear()
            strokesRef.current.forEach((s) => remove("strokes", s.id))
            strokesRef.current = []
          }}
          style={toolButtonStyle(false)}
        >
          <Eraser size={18} />
        </button>
      </div>
    </div>
  )
}

function toolButtonStyle(active: boolean): React.CSSProperties {
  return {
    display: "grid",
    placeItems: "center",
    width: 32,
    height: 32,
    borderRadius: "0.5rem",
    background: active ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "transparent",
    border: "none",
    color: active ? "var(--accent-strong)" : "var(--muted)",
    flexShrink: 0,
  }
}
