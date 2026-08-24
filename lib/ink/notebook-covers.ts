export type CoverStyleId = "espiral" | "fichario" | "brochura"

export const COVER_STYLES: { id: CoverStyleId; name: string }[] = [
  { id: "espiral", name: "Espiral" },
  { id: "fichario", name: "Fichário" },
  { id: "brochura", name: "Brochura" },
]

export const COVER_COLORS = ["#1e3a5f", "#3d3d3d", "#6b4530", "#4a5a3d", "#5a1f1f", "#eceef1"]

// Perceived brightness (per ITU-R BT.601) decides whether the cover needs
// light or dark ink/detailing on top of it.
export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}
