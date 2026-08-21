import { InkCanvas } from "@/components/ink-canvas"

export default function NotebooksPage() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        padding: "1.5rem",
        minHeight: 0,
      }}
    >
      <div
        style={{
          flex: 1,
          boxShadow: "0 20px 45px -20px var(--shadow)",
          borderRadius: "0.9rem",
          overflow: "hidden",
        }}
      >
        <InkCanvas />
      </div>
    </div>
  )
}
