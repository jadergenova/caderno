const DB_NAME = "caderno"
const DB_VERSION = 1

const STORES = ["notebooks", "pages", "strokes", "textboxes", "images", "assets"] as const
type StoreName = (typeof STORES)[number]

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains("notebooks")) {
        db.createObjectStore("notebooks", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("pages")) {
        db.createObjectStore("pages", { keyPath: "id" }).createIndex("notebookId", "notebookId")
      }
      if (!db.objectStoreNames.contains("strokes")) {
        db.createObjectStore("strokes", { keyPath: "id" }).createIndex("pageId", "pageId")
      }
      if (!db.objectStoreNames.contains("textboxes")) {
        db.createObjectStore("textboxes", { keyPath: "id" }).createIndex("pageId", "pageId")
      }
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" }).createIndex("pageId", "pageId")
      }
      if (!db.objectStoreNames.contains("assets")) {
        db.createObjectStore("assets", { keyPath: "id" })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  return dbPromise
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const req = fn(store)
    tx.oncomplete = () => resolve(req ? (req as IDBRequest<T>).result : (undefined as unknown as T))
    tx.onerror = () => reject(tx.error)
  })
}

export function put<T>(storeName: StoreName, value: T): Promise<T> {
  return withStore(storeName, "readwrite", (store) => store.put(value)).then(() => value)
}

export function get<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  return withStore<T>(storeName, "readonly", (store) => store.get(id))
}

export function getAll<T>(storeName: StoreName): Promise<T[]> {
  return withStore<T[]>(storeName, "readonly", (store) => store.getAll())
}

export function getAllByIndex<T>(storeName: StoreName, indexName: string, value: string): Promise<T[]> {
  return withStore<T[]>(storeName, "readonly", (store) => store.index(indexName).getAll(value))
}

export function remove(storeName: StoreName, id: string): Promise<void> {
  return withStore(storeName, "readwrite", (store) => store.delete(id))
}
