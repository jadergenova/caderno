import { isLightColor } from "@/lib/ink/notebook-covers"

export function NotebookCover({ coverStyle, coverColor }: { coverStyle: string; coverColor: string }) {
  const light = isLightColor(coverColor)
  const detail = light ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.55)"
  const detailStrong = light ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.8)"

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: coverColor,
        borderRadius: "0.6rem",
        overflow: "hidden",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
      }}
    >
      {coverStyle === "espiral" && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 10,
            right: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                border: `2px solid ${detailStrong}`,
              }}
            />
          ))}
        </div>
      )}

      {coverStyle === "fichario" && (
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)",
                border: `2px solid ${detailStrong}`,
              }}
            />
          ))}
        </div>
      )}

      {coverStyle === "brochura" && (
        <div
          style={{
            position: "absolute",
            top: "22%",
            left: "14%",
            right: "14%",
            height: 3,
            borderRadius: 2,
            background: detail,
          }}
        />
      )}
    </div>
  )
}
