import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
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
  refresh: () => void
  enter: (session: Session) => void
  leave: () => void
}

const HouseContext = createContext<HouseValue | null>(null)

export function HouseProvider({ children }: { children: ReactNode }) {
  const [session, setLocal] = useState<Session | null>(() => readSession())
  const [tick, setTick] = useState(0)
  const [remote, setRemote] = useState<DB | null>(null)

  useEffect(() => {
    if (!session || session.demo || !session.token) return
    let stop = false
    rumahCall("state", {}, session.token).then((result) => {
      if (stop || !result.ok || !result.db) return
      setRemote(result.db)
    })
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

  const value: HouseValue = {
    session,
    db,
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
