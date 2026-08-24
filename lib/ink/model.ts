export type Notebook = {
  id: string
  title: string
  order: number
  createdAt: number
  updatedAt: number
}

export type Page = {
  id: string
  notebookId: string
  order: number
  paperPresetId: string
  pageTemplate: string
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

export function createNotebook(title: string, order: number): Notebook {
  const now = Date.now()
  return { id: uuid(), title, order, createdAt: now, updatedAt: now }
}

export function createPage(notebookId: string, order: number): Page {
  return {
    id: uuid(),
    notebookId,
    order,
    paperPresetId: "cream",
    pageTemplate: "ruled",
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
  return { id: uuid(), pageId, x, y, width: 220, text: "", color: "#2a2420", updatedAt: Date.now() }
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
