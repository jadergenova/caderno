export type Notebook = {
  id: string
  title: string
  order: number
  coverStyle: string
  coverColor: string
  createdAt: number
  updatedAt: number
}

export type Page = {
  id: string
  notebookId: string
  order: number
  paperPresetId: string
  pageTemplate: string
  bookmarked: boolean
  updatedAt: number
}

export type Stroke = {
  id: string
  pageId: string
  color: string
  lineWidth: number
  penStyle: string
  points: { x: number; y: number }[]
  createdAt: number
}

export type TextBox = {
  id: string
  pageId: string
  x: number
  y: number
  width: number
  text: string
  color: string
  kind: "text" | "sticky"
  noteColor?: string
  rotation?: number
  updatedAt: number
}

export type ImageObject = {
  id: string
  pageId: string
  assetId: string
  x: number
  y: number
  width: number
  height: number
  updatedAt: number
}

export type Asset = {
  id: string
  blob: Blob
  mimeType: string
}

function uuid(): string {
  return crypto.randomUUID()
}

export function createNotebook(title: string, order: number, coverStyle: string, coverColor: string): Notebook {
  const now = Date.now()
  return { id: uuid(), title, order, coverStyle, coverColor, createdAt: now, updatedAt: now }
}

export function createPage(notebookId: string, order: number): Page {
  return {
    id: uuid(),
    notebookId,
    order,
    paperPresetId: "cream",
    pageTemplate: "ruled",
    bookmarked: false,
    updatedAt: Date.now(),
  }
}

export function createStroke(
  pageId: string,
  color: string,
  lineWidth: number,
  penStyle: string,
  points: { x: number; y: number }[]
): Stroke {
  return { id: uuid(), pageId, color, lineWidth, penStyle, points, createdAt: Date.now() }
}

export function createTextBox(pageId: string, x: number, y: number): TextBox {
  return {
    id: uuid(),
    pageId,
    x,
    y,
    width: 220,
    text: "",
    color: "#1b2430",
    kind: "text",
    updatedAt: Date.now(),
  }
}

const STICKY_COLORS = ["#fdf27a", "#ffb3c6", "#a8d8ff", "#c3f0ca", "#ffd2a6"]

export function createStickyNote(pageId: string, x: number, y: number): TextBox {
  const noteColor = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)]
  const rotation = Math.random() * 8 - 4
  return {
    id: uuid(),
    pageId,
    x,
    y,
    width: 160,
    text: "",
    color: "#2a2420",
    kind: "sticky",
    noteColor,
    rotation,
    updatedAt: Date.now(),
  }
}

export function createImageObject(
  pageId: string,
  assetId: string,
  x: number,
  y: number,
  width: number,
  height: number
): ImageObject {
  return { id: uuid(), pageId, assetId, x, y, width, height, updatedAt: Date.now() }
}

export function createAsset(blob: Blob): Asset {
  return { id: uuid(), blob, mimeType: blob.type || "application/octet-stream" }
}
