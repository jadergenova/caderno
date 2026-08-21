"use client"

import { useRef } from "react"
import { Trash2 } from "lucide-react"
import type { ImageObject } from "@/lib/ink/model"

type Props = {
  image: ImageObject
  src: string
  interactive: boolean
  onChange: (id: string, patch: Partial<ImageObject>) => void
  onCommit: (id: string) => void
  onDelete: (id: string) => void
}

export function ImageObjectView({ image, src, interactive, onChange, onCommit, onDelete }: Props) {
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; originW: number; originH: number } | null>(null)

  function onDragStart(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: image.x, originY: image.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onDragMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    onChange(image.id, { x: dragRef.current.originX + dx, y: dragRef.current.originY + dy })
  }

  function onDragEnd() {
    if (dragRef.current) onCommit(image.id)
    dragRef.current = null
  }

  function onResizeStart(e: React.PointerEvent) {
    e.stopPropagation()
    resizeRef.current = { startX: e.clientX, startY: e.clientY, originW: image.width, originH: image.height }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onResizeMove(e: React.PointerEvent) {
    if (!resizeRef.current) return
    const dx = e.clientX - resizeRef.current.startX
    const dy = e.clientY - resizeRef.current.startY
    onChange(image.id, {
      width: Math.max(60, resizeRef.current.originW + dx),
      height: Math.max(60, resizeRef.current.originH + dy),
    })
  }

  function onResizeEnd() {
    if (resizeRef.current) onCommit(image.id)
    resizeRef.current = null
  }

  return (
    <div
      style={{
        position: "absolute",
        left: image.x,
        top: image.y,
        width: image.width,
        height: image.height,
        pointerEvents: interactive ? "auto" : "none",
      }}
      onPointerDown={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "0.4rem",
          boxShadow: "0 6px 18px -8px var(--shadow)",
          outline: interactive ? "1px dashed var(--border)" : "none",
          cursor: interactive ? "grab" : "default",
        }}
      />
      {interactive && (
        <>
          <button
            onClick={() => onDelete(image.id)}
            aria-label="Excluir foto"
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--muted)",
              display: "grid",
              placeItems: "center",
              padding: 0,
            }}
          >
            <Trash2 size={12} />
          </button>
          <div
            onPointerDown={onResizeStart}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeEnd}
            style={{
              position: "absolute",
              bottom: -6,
              right: -6,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--accent)",
              cursor: "nwse-resize",
            }}
          />
        </>
      )}
    </div>
  )
}
