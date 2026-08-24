export type PenStyleId = "pen" | "pencil" | "highlighter"

export type PenStyleConfig = {
  id: PenStyleId
  name: string
  opacity: number
  cap: CanvasLineCap
  join: CanvasLineJoin
  widthScale: number
}

export const PEN_STYLES: PenStyleConfig[] = [
  { id: "pen", name: "Caneta", opacity: 1, cap: "round", join: "round", widthScale: 1 },
  { id: "pencil", name: "Lápis", opacity: 0.68, cap: "round", join: "round", widthScale: 0.85 },
  { id: "highlighter", name: "Marca-texto", opacity: 0.35, cap: "butt", join: "bevel", widthScale: 4.5 },
]

export function getPenStyle(id: string): PenStyleConfig {
  return PEN_STYLES.find((s) => s.id === id) ?? PEN_STYLES[0]
}

export type ThicknessLevel = {
  id: string
  name: string
  base: number
}

export const THICKNESS_LEVELS: ThicknessLevel[] = [
  { id: "fine", name: "Fina", base: 1.4 },
  { id: "medium", name: "Média", base: 2.5 },
  { id: "thick", name: "Grossa", base: 4.5 },
]

export function getThickness(id: string): ThicknessLevel {
  return THICKNESS_LEVELS.find((t) => t.id === id) ?? THICKNESS_LEVELS[1]
}
