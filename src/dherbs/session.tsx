import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
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

  const db = useMemo(
    () => (session ? loadDB(session.demo) : loadDB(false)),
    [session, tick],
  )

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
