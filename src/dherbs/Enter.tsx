import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { SIGNUP_RANKS, rankLabel, type SignupRank } from "./catalog"
import { rumahCall } from "./remote"
import { useHouse } from "./session"
import { openContoh, registerAgent, signIn } from "./store"

export function Enter() {
  const navigate = useNavigate()
  const { enter } = useHouse()
  const [mode, setMode] = useState<"masuk" | "daftar">("daftar")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [rank, setRank] = useState<SignupRank>("ejen")
  const [stokisCode, setStokisCode] = useState("")
  const [error, setError] = useState("")
  const [rumahOpen, setRumahOpen] = useState(true)

  useEffect(() => {
    rumahCall("status")
      .then((result) => {
        if (result.ok) setRumahOpen(Boolean(result.rumah))
      })
      .catch(() => setRumahOpen(true))
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const door = rank === "ejen" || rank === "dropship" ? "/kedai" : "/pesanan"
    try {
      const result =
        mode === "daftar"
          ? await rumahCall("daftar", { name, username, email, phone, password: pin, rank, code: stokisCode })
          : await rumahCall("masuk", { username: phone || username, password: pin })
      if (!result.ok || !result.token || !result.agent) {
        setError(result.ok ? "Akaun tidak dibuka." : result.error)
        return
      }
      enter({ id: result.agent.id, demo: false, token: result.token })
      navigate(result.agent.rank === "rumah" ? "/pesanan" : door)
      return
    } catch {
      if (mode === "daftar") {
        const result = registerAgent(false, { name, phone, pin, rank, stokisCode, username, email })
        if (!result.ok) {
          setError(result.error)
          return
        }
        enter({ id: result.agent.id, demo: false })
      } else {
        const result = signIn(false, phone || username, pin)
        if (!result.ok) {
          setError(result.error)
          return
        }
        enter({ id: result.agent.id, demo: false })
      }
      navigate(door)
    }
  }

  async function openHouse() {
    const result = await rumahCall("buka", { name, username, email, phone, password: pin })
    if (!result.ok || !result.token || !result.agent) {
      setError(result.ok ? "Meja rumah tidak dibuka." : result.error)
      return
    }
    enter({ id: result.agent.id, demo: false, token: result.token })
    navigate("/pesanan")
  }

  return (
    <article className="page">
      <div className="letter-grid wrap">
        <header className="page-head">
          <p className="section-label">{mode === "daftar" ? "Daftar" : "Masuk"}</p>
          <h1>{mode === "daftar" ? "Masuk ke rumah." : "Selamat kembali."}</h1>
          <p className="lede">
            Akaun ini percuma. Harga bergantung pada saiz satu resit. Inventori hanya untung
            pada set yang benar-benar berpindah.
          </p>
          <button
            type="button"
            className="text-button"
            onClick={() => setMode(mode === "daftar" ? "masuk" : "daftar")}
          >
            {mode === "daftar" ? "Saya sudah ada akaun" : "Saya belum ada akaun"}
          </button>
        </header>
        <form className="letter-form" onSubmit={onSubmit}>
          {mode === "daftar" ? (
            <fieldset className="rank-pick">
              <legend>Pangkat</legend>
              {SIGNUP_RANKS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={rank === item}
                  onClick={() => setRank(item)}
                >
                  {rankLabel(item)}
                </button>
              ))}
            </fieldset>
          ) : null}
          {mode === "daftar" ? (
            <>
              <label className="field">
                <span>Nama</span>
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="field">
                <span>Username</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} />
              </label>
              <label className="field">
                <span>E-mel</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            </>
          ) : null}
          <label className="field">
            <span>{mode === "daftar" ? "Telefon" : "Username atau telefon"}</span>
            <input
              autoComplete="username"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Kata laluan</span>
            <input
              type="password"
              autoComplete={mode === "daftar" ? "new-password" : "current-password"}
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
          </label>
          {mode === "daftar" && rank === "ejen" ? (
            <label className="field">
              <span>Kod inventori, jika ada</span>
              <input
                value={stokisCode}
                onChange={(event) => setStokisCode(event.target.value)}
              />
            </label>
          ) : null}
          {error ? <p className="field-error">{error}</p> : null}
          <button className="send" type="submit">
            {mode === "daftar" ? "Daftar" : "Masuk"}
          </button>
          {mode === "daftar" && !rumahOpen ? (
            <button className="text-button" type="button" onClick={openHouse}>
              Buka meja rumah
            </button>
          ) : null}
          <button
            type="button"
            className="text-button contoh-link"
            onClick={() => {
              openContoh()
              enter({ id: "farah", demo: true })
              navigate("/stok")
            }}
          >
            Lihat contoh stok dan dompet
          </button>
        </form>
      </div>
    </article>
  )
}
