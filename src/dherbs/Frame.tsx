import { useEffect } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useCart } from "./cart"
import { useHouse } from "./session"

const agentRooms = [
  { to: "/kedai", label: "Kedai" },
  { to: "/troli", label: "Troli" },
  { to: "/stok", label: "Stok" },
  { to: "/dompet", label: "Dompet" },
]
const houseRooms = [{ to: "/pesanan", label: "Pesanan" }]

const contoh = [
  { id: "farah", label: "Farah · Inventori" },
  { id: "hana", label: "Hana · Ejen" },
  { id: "rizal", label: "Rizal · Dropship" },
  { id: "rumah", label: "Rumah" },
]

export function Frame() {
  const { session, db, leave, enter } = useHouse()
  const cart = useCart()
  const { pathname } = useLocation()
  const agent = session ? db.agents.find((item) => item.id === session.id) : undefined
  const rooms = agent?.rank === "rumah" ? houseRooms : agentRooms

  useEffect(() => {
    document.title = "D'Herbs"
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="app-modern">
      <header className="nav">
        <Link to="/" className="brand" aria-label="D'Herbs">
          D'Herbs
        </Link>
        {agent ? (
          <nav className="desk" aria-label="Bilik ejen">
            {rooms.map((room) => (
              <NavLink key={room.to} to={room.to}>
                {room.label}
                {room.to === "/troli" && cart.count > 0 ? ` ${cart.count}` : ""}
              </NavLink>
            ))}
          </nav>
        ) : null}
        <div className="nav-end">
          {agent ? (
            <button type="button" className="nav-action" onClick={leave}>
              Keluar
            </button>
          ) : (
            <Link className="nav-action" to="/masuk">
              Masuk
            </Link>
          )}
        </div>
      </header>
      {session?.demo && agent ? (
        <div className="demo-switch">
          {contoh.map((person) => (
            <button
              key={person.id}
              type="button"
              aria-pressed={agent.id === person.id}
              onClick={() => enter({ id: person.id, demo: true })}
            >
              {person.label}
            </button>
          ))}
        </div>
      ) : null}
      {agent ? (
        <nav className="room-bar" aria-label="Bilik ejen">
          {rooms.map((room) => (
            <NavLink key={room.to} to={room.to}>
              {room.label}
              {room.to === "/troli" && cart.count > 0 ? ` ${cart.count}` : ""}
            </NavLink>
          ))}
        </nav>
      ) : null}
      <main id="isi">
        <Outlet />
      </main>
      <footer className="foot">
        <div className="wrap foot-inner">
          <p>D'Herbs</p>
          <p className="foot-mark">Set yang lebih kecil</p>
          <p className="foot-year">2026</p>
        </div>
      </footer>
    </div>
  )
}
