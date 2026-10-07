import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { SIGNUP_RANKS, rankLabel, type SignupRank } from "./catalog"
import { useHouse } from "./session"
import { openContoh, registerAgent, signIn } from "./store"

export function Enter() {
  const navigate = useNavigate()
  const { enter } = useHouse()
  const [mode, setMode] = useState<"masuk" | "daftar">("daftar")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [rank, setRank] = useState<SignupRank>("ejen")
  const [stokisCode, setStokisCode] = useState("")
  const [error, setError] = useState("")

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (mode === "daftar") {
      const result = registerAgent(false, { name, phone, pin, rank, stokisCode })
      if (!result.ok) {
        setError(result.error)
        return
      }
      enter({ id: result.agent.id, demo: false })
    } else {
      const result = signIn(false, phone, pin)
      if (!result.ok) {
        setError(result.error)
        return
      }
      enter({ id: result.agent.id, demo: false })
    }
    navigate("/kedai")
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
            <label className="field">
              <span>Nama</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          ) : null}
          <label className="field">
            <span>Telefon</span>
            <input
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label className="field">
            <span>PIN</span>
            <input
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
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
