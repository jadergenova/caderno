import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const name = process.env.ADMIN_NAME
  const username = process.env.ADMIN_USERNAME
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!name || !username || !email || !password) {
    throw new Error(
      "Defina ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar o seed."
    )
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { username },
    update: { name, email, passwordHash },
    create: { name, username, email, passwordHash },
  })

  console.log(`Usuário "${username}" criado/atualizado.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
