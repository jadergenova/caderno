export type InkPoint = { x: number; y: number }

export type InkEngineMode = "draw" | "erase"

export type InkEngineOptions = {
  color: string
  lineWidth: number
  opacity?: number
  cap?: CanvasLineCap
  join?: CanvasLineJoin
  allowFingerDrawing?: boolean
  mode?: InkEngineMode
  onStrokeEnd?: (points: InkPoint[]) => void
  onErase?: (point: InkPoint) => void
}

export type InkEngineHandle = {
  setColor(color: string): void
  setLineWidth(width: number): void
  setStrokeStyle(style: { opacity: number; cap: CanvasLineCap; join: CanvasLineJoin }): void
  setAllowFingerDrawing(allow: boolean): void
  setMode(mode: InkEngineMode): void
  clear(): void
  destroy(): void
}

function midpoint(a: InkPoint, b: InkPoint): InkPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

// Draws a full, already-completed stroke in one pass — used to replay
// persisted strokes on page load (as opposed to the incremental drawing
// used while a pointer is actively moving).
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  points: InkPoint[],
  color: string,
  lineWidth: number,
  opacity = 1,
  cap: CanvasLineCap = "round",
  join: CanvasLineJoin = "round"
) {
  if (points.length < 2) return

  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.globalAlpha = opacity
  ctx.lineCap = cap
  ctx.lineJoin = join

  if (points.length === 2) {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(points[1].x, points[1].y)
    ctx.stroke()
    ctx.globalAlpha = 1
    return
  }

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const mid1 = midpoint(p0, p1)
    const mid2 = midpoint(p1, p2)
    ctx.beginPath()
    ctx.moveTo(mid1.x, mid1.y)
    ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

export function attachInkEngine(canvas: HTMLCanvasElement, options: InkEngineOptions): InkEngineHandle {
  const ctx2d = canvas.getContext("2d")
  if (!ctx2d) throw new Error("Canvas 2D context not available")
  const context: CanvasRenderingContext2D = ctx2d

  let currentPoints: InkPoint[] = []
  let pendingPoints: InkPoint[] = []
  let lastDrawnIndex = 0
  let drawing = false
  let activePointerId: number | null = null
  let activePointerType: string | null = null
  let rafScheduled = false

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
    context.globalAlpha = options.opacity ?? 1
    context.lineCap = options.cap ?? "round"
    context.lineJoin = options.join ?? "round"

    if (pts.length < 3) {
      if (pts.length === 2 && lastDrawnIndex === 0) {
        context.beginPath()
        context.moveTo(pts[0].x, pts[0].y)
        context.lineTo(pts[1].x, pts[1].y)
        context.stroke()
      }
      context.globalAlpha = 1
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
    context.globalAlpha = 1
  }

  // Palm rejection: a real Apple Pencil always reports pointerType "pen",
  // which always wins. A bare touch is almost always a resting palm — on a
  // device with pen support the palm typically lands at the same time as
  // (or just before) the pen tip, so "no pen seen very recently" is NOT a
  // safe signal to let touch draw. Touch only draws when the user opts in
  // via "modo dedo" (no pencil available).
  function shouldStartStroke(e: PointerEvent): boolean {
    if (e.pointerType === "pen" || e.pointerType === "mouse") return true
    if (e.pointerType === "touch") return options.allowFingerDrawing === true
    return false
  }

  // setPointerCapture/releasePointerCapture can throw (e.g. the pointer was
  // already implicitly released). Never let that leave activePointerId
  // stuck, or every future stroke would be silently ignored until reload.
  function safeReleaseCapture(pointerId: number) {
    try {
      canvas.releasePointerCapture(pointerId)
    } catch {
      // ignored — pointer was already released
    }
  }

  function cancelActiveStroke() {
    if (activePointerId !== null) safeReleaseCapture(activePointerId)
    drawing = false
    activePointerId = null
    activePointerType = null
    currentPoints = []
    pendingPoints = []
  }

  function onPointerDown(e: PointerEvent) {
    if (activePointerId !== null) {
      // A real pencil touching down always preempts an in-progress finger
      // stroke (relevant when "modo dedo" was on and the user grabs the pen).
      if (e.pointerType === "pen" && activePointerType === "touch") {
        cancelActiveStroke()
      } else {
        return
      }
    }

    if (!shouldStartStroke(e)) return

    activePointerId = e.pointerId
    activePointerType = e.pointerType
    drawing = true
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      // Drawing still works without capture — it's just less reliable if
      // the pointer strays outside the canvas mid-stroke.
    }

    if (options.mode === "erase") {
      options.onErase?.(toLocalPoint(e))
    } else {
      currentPoints = [toLocalPoint(e)]
      pendingPoints = []
      lastDrawnIndex = 0
    }
    e.preventDefault()
  }

  function onPointerMove(e: PointerEvent) {
    if (!drawing || e.pointerId !== activePointerId) return

    const raw = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e]
    const events = raw.length ? raw : [e]

    if (options.mode === "erase") {
      for (const ev of events) options.onErase?.(toLocalPoint(ev as PointerEvent))
    } else {
      for (const ev of events) pendingPoints.push(toLocalPoint(ev as PointerEvent))
      scheduleFrame()
    }
    e.preventDefault()
  }

  function endStroke(e: PointerEvent) {
    if (e.pointerId !== activePointerId) return
    if (options.mode !== "erase") {
      renderPending()
      if (currentPoints.length > 1) options.onStrokeEnd?.(currentPoints)
    }
    safeReleaseCapture(e.pointerId)
    drawing = false
    activePointerId = null
    activePointerType = null
    currentPoints = []
  }

  canvas.addEventListener("pointerdown", onPointerDown)
  canvas.addEventListener("pointermove", onPointerMove)
  canvas.addEventListener("pointerup", endStroke)
  canvas.addEventListener("pointercancel", endStroke)

  // Backup net: if pointer capture silently failed (or isn't honored) and
  // the pointer is released outside the canvas, the listeners above would
  // never see it, leaving activePointerId stuck forever. window-level
  // listeners catch that; endStroke already no-ops for unrelated pointers.
  window.addEventListener("pointerup", endStroke)
  window.addEventListener("pointercancel", endStroke)

  return {
    setColor(color) {
      options.color = color
    },
    setLineWidth(width) {
      options.lineWidth = width
    },
    setStrokeStyle(style) {
      options.opacity = style.opacity
      options.cap = style.cap
      options.join = style.join
    },
    setAllowFingerDrawing(allow) {
      options.allowFingerDrawing = allow
    },
    setMode(mode) {
      options.mode = mode
    },
    clear() {
      context.clearRect(0, 0, canvas.width, canvas.height)
    },
    destroy() {
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", endStroke)
      canvas.removeEventListener("pointercancel", endStroke)
      window.removeEventListener("pointerup", endStroke)
      window.removeEventListener("pointercancel", endStroke)
    },
  }
}
