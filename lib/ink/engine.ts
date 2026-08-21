export type InkPoint = { x: number; y: number }

export type InkEngineOptions = {
  color: string
  lineWidth: number
  onStrokeEnd?: (points: InkPoint[]) => void
}

export type InkEngineHandle = {
  setColor(color: string): void
  setLineWidth(width: number): void
  clear(): void
  destroy(): void
}

function midpoint(a: InkPoint, b: InkPoint): InkPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

// Palm-rejection heuristic: a real Apple Pencil always reports pointerType
// "pen". Touch is only allowed to draw as a fallback when no pen has been
// seen recently, so a resting hand doesn't fight an active pen stroke.
const PEN_GRACE_MS = 400

export function attachInkEngine(canvas: HTMLCanvasElement, options: InkEngineOptions): InkEngineHandle {
  const ctx2d = canvas.getContext("2d")
  if (!ctx2d) throw new Error("Canvas 2D context not available")
  const context: CanvasRenderingContext2D = ctx2d

  let currentPoints: InkPoint[] = []
  let pendingPoints: InkPoint[] = []
  let lastDrawnIndex = 0
  let drawing = false
  let activePointerId: number | null = null
  let rafScheduled = false
  let lastPenActivity = 0

  function toLocalPoint(e: PointerEvent): InkPoint {
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function scheduleFrame() {
    if (rafScheduled) return
    rafScheduled = true
    requestAnimationFrame(renderPending)
  }

  function renderPending() {
    rafScheduled = false
    if (pendingPoints.length === 0) return

    currentPoints.push(...pendingPoints)
    pendingPoints = []

    const pts = currentPoints
    context.strokeStyle = options.color
    context.lineWidth = options.lineWidth
    context.lineCap = "round"
    context.lineJoin = "round"

    if (pts.length < 3) {
      if (pts.length === 2 && lastDrawnIndex === 0) {
        context.beginPath()
        context.moveTo(pts[0].x, pts[0].y)
        context.lineTo(pts[1].x, pts[1].y)
        context.stroke()
      }
      return
    }

    const from = Math.max(1, lastDrawnIndex)
    for (let i = from; i < pts.length - 1; i++) {
      const p0 = pts[i - 1]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const mid1 = midpoint(p0, p1)
      const mid2 = midpoint(p1, p2)
      context.beginPath()
      context.moveTo(mid1.x, mid1.y)
      context.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y)
      context.stroke()
    }
    lastDrawnIndex = pts.length - 1
  }

  function shouldStartStroke(e: PointerEvent): boolean {
    if (e.pointerType === "pen" || e.pointerType === "mouse") return true
    if (e.pointerType === "touch") return Date.now() - lastPenActivity > PEN_GRACE_MS
    return false
  }

  function onPointerDown(e: PointerEvent) {
    if (activePointerId !== null || !shouldStartStroke(e)) return

    if (e.pointerType === "pen") lastPenActivity = Date.now()

    activePointerId = e.pointerId
    drawing = true
    canvas.setPointerCapture(e.pointerId)
    currentPoints = [toLocalPoint(e)]
    pendingPoints = []
    lastDrawnIndex = 0
    e.preventDefault()
  }

  function onPointerMove(e: PointerEvent) {
    if (!drawing || e.pointerId !== activePointerId) return
    if (e.pointerType === "pen") lastPenActivity = Date.now()

    const events = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e]
    for (const ev of events.length ? events : [e]) {
      pendingPoints.push(toLocalPoint(ev as PointerEvent))
    }
    scheduleFrame()
    e.preventDefault()
  }

  function endStroke(e: PointerEvent) {
    if (e.pointerId !== activePointerId) return
    renderPending()
    canvas.releasePointerCapture(e.pointerId)
    drawing = false
    activePointerId = null
    if (currentPoints.length > 1) options.onStrokeEnd?.(currentPoints)
    currentPoints = []
  }

  canvas.addEventListener("pointerdown", onPointerDown)
  canvas.addEventListener("pointermove", onPointerMove)
  canvas.addEventListener("pointerup", endStroke)
  canvas.addEventListener("pointercancel", endStroke)

  return {
    setColor(color) {
      options.color = color
    },
    setLineWidth(width) {
      options.lineWidth = width
    },
    clear() {
      context.clearRect(0, 0, canvas.width, canvas.height)
    },
    destroy() {
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", endStroke)
      canvas.removeEventListener("pointercancel", endStroke)
    },
  }
}
