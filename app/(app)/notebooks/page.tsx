import { auth } from "@/lib/auth"

export default async function NotebooksPage() {
  const session = await auth()

  return (
    <main style={{ padding: 24 }}>
      <h1>Meus cadernos</h1>
      <p>Olá, {session?.user?.name}. A estante de cadernos entra na próxima fase.</p>
    </main>
  )
}
