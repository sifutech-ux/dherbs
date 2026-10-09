import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { catalog, type Product } from "./catalog"
import { rumahCall } from "./remote"
import {
  loadDB,
  readSession,
  setSession,
  type DB,
  type Session,
} from "./store"

type HouseValue = {
  session: Session | null
  db: DB
  products: Product[]
  catalogReady: boolean
  refresh: () => void
  enter: (session: Session) => void
  leave: () => void
}

const HouseContext = createContext<HouseValue | null>(null)

export function HouseProvider({ children }: { children: ReactNode }) {
  const [session, setLocal] = useState<Session | null>(() => readSession())
  const [tick, setTick] = useState(0)
  const [remote, setRemote] = useState<DB | null>(null)
  const [shelf, setShelf] = useState<Product[]>([])
  const [shelfReady, setShelfReady] = useState(false)

  useEffect(() => {
    if (session?.demo) return
    let stop = false
    const load = async () => {
      try {
        const result = session?.token
          ? await rumahCall("state", {}, session.token)
          : await rumahCall("katalog")
        if (stop || !result.ok) {
          if (!stop) setShelfReady(true)
          return
        }
        if (result.db) setRemote(result.db)
        setShelf(result.products ?? [])
        setShelfReady(true)
      } catch {
        if (!stop) setShelfReady(true)
      }
    }
    load()
    return () => {
      stop = true
    }
  }, [session, tick])

  const db = useMemo(() => {
    if (session && !session.demo && session.token) {
      return remote ?? { agents: [], orders: [], sales: [], dropships: [] }
    }
    return loadDB(session?.demo ?? false)
  }, [session, tick, remote])

  const products = session?.demo ? catalog : shelf

  const value: HouseValue = {
    session,
    db,
    products,
    catalogReady: session?.demo ? true : shelfReady,
    refresh: () => setTick((n) => n + 1),
    enter: (next) => {
      setSession(next)
      setLocal(next)
    },
    leave: () => {
      setSession(null)
      setLocal(null)
    },
  }

  return <HouseContext.Provider value={value}>{children}</HouseContext.Provider>
}

export function useHouse() {
  const value = useContext(HouseContext)
  if (!value) throw new Error("useHouse must be used within HouseProvider")
  return value
}
