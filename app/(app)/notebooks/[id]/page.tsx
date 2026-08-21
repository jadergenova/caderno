import { NotebookEditor } from "./client"

export default async function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NotebookEditor notebookId={id} />
}
