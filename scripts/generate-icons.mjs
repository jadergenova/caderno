import sharp from "sharp"
import { mkdirSync } from "node:fs"

const sizes = [180, 192, 512]

mkdirSync("public/icons", { recursive: true })

for (const size of sizes) {
  await sharp("scripts/icon-source.svg")
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`)
  console.log(`wrote icon-${size}.png`)
}
