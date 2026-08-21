import type { CSSProperties } from "react"

export type PageTemplate = "blank" | "ruled" | "grid" | "dotted"

export type PaperPreset = {
  id: string
  name: string
  paperColor: string
  lineColor: string
}

export const PAPER_PRESETS: PaperPreset[] = [
  { id: "cream", name: "Creme", paperColor: "#fffaf0", lineColor: "#d9c9a8" },
  { id: "white", name: "Branco", paperColor: "#ffffff", lineColor: "#dcdcdc" },
  { id: "gray", name: "Cinza", paperColor: "#e8e5df", lineColor: "#c7c2b8" },
  { id: "sepia", name: "Sépia", paperColor: "#f1e3c6", lineColor: "#d2b783" },
  { id: "dark", name: "Escuro", paperColor: "#211f1a", lineColor: "#3c382e" },
]

export const PAGE_TEMPLATES: { id: PageTemplate; name: string }[] = [
  { id: "blank", name: "Lisa" },
  { id: "ruled", name: "Pautada" },
  { id: "grid", name: "Quadriculada" },
  { id: "dotted", name: "Pontilhada" },
]

const RULED_SPACING = 32
const GRID_SPACING = 24
const DOT_SPACING = 22

export function pageBackgroundStyle(preset: PaperPreset, template: PageTemplate): CSSProperties {
  const base: CSSProperties = { backgroundColor: preset.paperColor }

  if (template === "blank") return base

  if (template === "ruled") {
    return {
      ...base,
      backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${RULED_SPACING - 1}px, ${preset.lineColor} ${RULED_SPACING - 1}px, ${preset.lineColor} ${RULED_SPACING}px)`,
    }
  }

  if (template === "grid") {
    return {
      ...base,
      backgroundImage: [
        `repeating-linear-gradient(to bottom, transparent 0, transparent ${GRID_SPACING - 1}px, ${preset.lineColor} ${GRID_SPACING - 1}px, ${preset.lineColor} ${GRID_SPACING}px)`,
        `repeating-linear-gradient(to right, transparent 0, transparent ${GRID_SPACING - 1}px, ${preset.lineColor} ${GRID_SPACING - 1}px, ${preset.lineColor} ${GRID_SPACING}px)`,
      ].join(", "),
    }
  }

  return {
    ...base,
    backgroundImage: `radial-gradient(circle, ${preset.lineColor} 1.1px, transparent 1.6px)`,
    backgroundSize: `${DOT_SPACING}px ${DOT_SPACING}px`,
  }
}
