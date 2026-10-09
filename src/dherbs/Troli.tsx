import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "./cart"
import {
  RECEIPT_AGEN,
  RECEIPT_MASTER,
  RECEIPT_STOCKIST,
  quoteReceipt,
  rm,
  tierLabel,
  unitPrice,
} from "./catalog"
import { useHouse } from "./session"
import { rumahCall } from "./remote"
import { checkoutCompany, checkoutDropship } from "./store"

export function Troli() {
  const { session, db, products, refresh } = useHouse()
  const cart = useCart()
  const agent = db.agents.find((item) => item.id === session?.id)
  const [notice, setNotice] = useState("")
  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  if (!session) return null
  if (!agent) {
    return (
      <p className="quiet wrap page">
        Contoh ini telah dikemas kini. Buka semula dari halaman masuk.
      </p>
    )
  }

  const priced = cart.lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId)
    return product ? [{ product, qty: line.qty }] : []
  })
  const quote = quoteReceipt(priced)
  const agentTotal = priced.reduce(
    (sum, line) => sum + unitPrice(line.product, "agen") * line.qty,
    0,
  )
  const stockistTotal = priced.reduce(
    (sum, line) => sum + unitPrice(line.product, "stockist") * line.qty,
    0,
  )
  const masterTotal = priced.reduce(
    (sum, line) => sum + unitPrice(line.product, "master") * line.qty,
    0,
  )
  const next =
    quote.tier === "pelanggan"
      ? `Tambah ${rm(Math.max(0, RECEIPT_AGEN - agentTotal))} lagi, pada harga agen, untuk resit agen.`
      : quote.tier === "agen"
        ? `Tambah ${rm(Math.max(0, RECEIPT_STOCKIST - stockistTotal))} lagi, pada harga stockist, untuk resit stockist.`
        : quote.tier === "stockist"
          ? `Tambah ${rm(Math.max(0, RECEIPT_MASTER - masterTotal))} lagi, pada harga master, untuk resit master.`
          : "Resit ini sudah pada harga master."

  return (
    <article className="page wallet">
      <header className="page-head wrap">
        <p className="section-label">Troli</p>
        <h1>Satu resit.</h1>
        <p className="lede">
          {agent.rank === "dropship"
            ? "Harga dikira pada resit ini. Rumah menghantar kepada pelanggan. Inventori orang lain tidak dibayar."
            : "Harga dikira pada resit ini sahaja. Belian syarikat tidak mengisi dompet sesiapa yang lain."}
        </p>
      </header>
      <section className="wrap">
        {cart.lines.length === 0 ? (
          <p className="quiet">
            Troli kosong. <Link to="/kedai">Pilih di kedai.</Link>
          </p>
        ) : (
          <>
            <article className="wallet-card">
              <p>{tierLabel(quote.tier)}</p>
              <p className="wallet-balance">{rm(quote.total)}</p>
              <p className="wallet-pending">{next}</p>
            </article>
            <ul className="tx">
              {cart.lines.map((line) => {
                const product = products.find((item) => item.id === line.productId)
                if (!product) return null
                const unit = unitPrice(product, quote.tier)
                return (
                  <li key={line.productId}>
                    <span className="tx-mark">{line.qty}</span>
                    <p>
                      <strong>{product.name}</strong>
                      <small>
                        {rm(unit)} seunit · {tierLabel(quote.tier)}
                      </small>
                    </p>
                    <span className="qty">
                      <button
                        type="button"
                        onClick={() => cart.setQty(line.productId, line.qty - 1)}
                      >
                        −
                      </button>
                      <em>{rm(unit * line.qty)}</em>
                      <button
                        type="button"
                        onClick={() => cart.setQty(line.productId, line.qty + 1)}
                      >
                        +
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
        {agent.rank === "dropship" && cart.lines.length > 0 ? (
          <form
            className="drop-form cart-form"
            onSubmit={(event) => {
              event.preventDefault()
              const result = checkoutDropship(session.demo, agent.id, cart.lines, {
                customer,
                phone,
                address,
              })
              if (!result.ok) {
                setNotice(result.error)
                return
              }
              cart.clear()
              setCustomer("")
              setPhone("")
              setAddress("")
              setNotice(`Pesanan ${tierLabel(result.tier)} diterima. Rumah yang menghantar.`)
              refresh()
            }}
          >
            <label className="field">
              <span>Nama pelanggan</span>
              <input value={customer} onChange={(event) => setCustomer(event.target.value)} />
            </label>
            <label className="field">
              <span>Telefon pelanggan</span>
              <input
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <label className="field wide">
              <span>Alamat penghantaran</span>
              <textarea
                rows={3}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </label>
            <button className="send" type="submit">
              Hantar kepada rumah · {rm(quote.total)}
            </button>
          </form>
        ) : null}
        {agent.rank === "ejen" && cart.lines.length > 0 ? (
          <button
            type="button"
            className="send"
            onClick={async () => {
              const result = session.demo
                ? checkoutCompany(session.demo, agent.id, cart.lines)
                : await rumahCall("beli", { lines: cart.lines }, session.token)
              if (!result.ok) {
                setNotice(result.error)
                return
              }
              cart.clear()
              setNotice(
                `Resit ${tierLabel(result.tier as "master" | "stockist" | "agen" | "pelanggan")} ${rm(result.total ?? 0)}. Stok masuk selepas rumah sahkan bayaran.`,
              )
              refresh()
            }}
          >
            Beli dari syarikat · {rm(quote.total)}
          </button>
        ) : null}
        {notice ? <p className="shop-note">{notice}</p> : null}
      </section>
    </article>
  )
}
