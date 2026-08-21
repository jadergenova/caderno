"use client"

import { useEffect, useRef } from "react"
import { GripHorizontal, Trash2 } from "lucide-react"
import type { TextBox } from "@/lib/ink/model"

type Props = {
  textBox: TextBox
  interactive: boolean
  autoFocus?: boolean
  onChange: (id: string, patch: Partial<TextBox>) => void
  onCommit: (id: string) => void
  onDelete: (id: string) => void
}

export function TextBoxView({ textBox, interactive, autoFocus, onChange, onCommit, onDelete }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
    if (autoFocus) el.focus()
    // Only run on mount for this instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onDragStart(e: React.PointerEvent) {
    e.stopPropagation()
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: textBox.x, originY: textBox.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onDragMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    onChange(textBox.id, { x: dragRef.current.originX + dx, y: dragRef.current.originY + dy })
  }

  function onDragEnd() {
    if (dragRef.current) onCommit(textBox.id)
    dragRef.current = null
  }

  return (
    <div
      style={{
        position: "absolute",
        left: textBox.x,
        top: textBox.y,
        width: textBox.width,
        pointerEvents: interactive ? "auto" : "none",
      }}
    >
      {interactive && (
        <div
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "grab",
            color: "var(--muted)",
          }}
        >
          <GripHorizontal size={14} />
          <button
            onClick={() => onDelete(textBox.id)}
            aria-label="Excluir texto"
            style={{ background: "none", border: "none", color: "var(--muted)", padding: 2, cursor: "pointer" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
      <textarea
        ref={taRef}
        defaultValue={textBox.text}
        readOnly={!interactive}
        rows={1}
        onInput={(e) => {
          const el = e.currentTarget
          el.style.height = "auto"
          el.style.height = `${el.scrollHeight}px`
        }}
        onBlur={(e) => {
          onChange(textBox.id, { text: e.currentTarget.value })
          onCommit(textBox.id)
        }}
        style={{
          width: "100%",
          resize: "none",
          border: interactive ? "1px dashed var(--border)" : "none",
          borderRadius: "0.3rem",
          background: "transparent",
          color: textBox.color,
          fontSize: "1rem",
          fontFamily: "inherit",
          lineHeight: 1.4,
          padding: "0.25rem 0.4rem",
          overflow: "hidden",
        }}
      />
    </div>
  )
}
