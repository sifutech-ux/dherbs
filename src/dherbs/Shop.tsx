import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "./cart"
import {
  RECEIPT_AGEN,
  RECEIPT_MASTER,
  RECEIPT_STOCKIST,
  rankLabel,
  rm,
  unitPrice,
} from "./catalog"
import { useHouse } from "./session"
import { buyFromInventory, recordRetail, stockCount } from "./store"

export function Shop({ agentView }: { agentView: boolean }) {
  const { session, db, products, catalogReady, refresh } = useHouse()
  const cart = useCart()
  const live = !session?.demo
  const agent =
    agentView && session ? db.agents.find((item) => item.id === session.id) : undefined
  const [notice, setNotice] = useState("")
  const [qty, setQty] = useState<Record<string, number>>({})

  useEffect(() => {
    setNotice("")
  }, [agent?.id])

  return (
    <article className="page">
      <header className="hero dherbs-hero">
        <p className="eyebrow">{agent ? rankLabel(agent.rank) : "D'Herbs"}</p>
        <h1 className="dherbs-title">{live ? "Kedai." : "Set yang lebih kecil."}</h1>
        <p className="hero-line">
          {agent?.rank === "dropship"
            ? "Isi troli dan alamat pelanggan. Harga ikut jumlah resit itu. Rumah yang menghantar."
            : "Harga satu resit bergantung pada jumlahnya. Inventori orang lain hanya untung bila set mereka yang berpindah."}
        </p>
      </header>
      <section className="wrap dherbs-sets">
        <p className="section-label">{live ? "Senarai" : "Harga contoh"}</p>
        {!catalogReady ? (
          <p className="quiet">Senarai kedai dimuatkan.</p>
        ) : products.length === 0 ? (
          <p className="quiet">Kedai belum ada produk.</p>
        ) : null}
        <ol className="set-list">
          {(catalogReady ? products : []).map((product, index) => {
            const own = agent ? stockCount(db, agent.id, product.id) : 0
            const supplier =
              agent?.rank === "ejen" && agent.supplierId
                ? db.agents.find((item) => item.id === agent.supplierId)
                : undefined
            const supplierStock = supplier ? stockCount(db, supplier.id, product.id) : 0
            const amount = qty[product.id] ?? 1
            return (
              <li className="set-item" key={product.id}>
                <div className="set-row">
                  <span className="plan-index">0{index + 1}</span>
                  <div>
                    <h2>{product.name}</h2>
                    <p>{product.line}</p>
                    <p className="set-price">
                      Pasaran {rm(product.sell)}
                      <span>Agen {rm(unitPrice(product, "agen"))}</span>
                      <span>Stockist {rm(unitPrice(product, "stockist"))}</span>
                      <span>Master {rm(unitPrice(product, "master"))}</span>
                    </p>
                    {agent && agent.rank !== "dropship" ? (
                      <p className="stock-note">
                        {own} di tangan
                        {supplier && supplierStock > 0
                          ? ` · ${supplier.name} ada ${supplierStock}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                  {agentView && agent && session ? (
                    <div className="set-actions">
                      <div className="qty">
                        <button
                          type="button"
                          onClick={() =>
                            setQty((current) => ({
                              ...current,
                              [product.id]: Math.max(1, amount - 1),
                            }))
                          }
                        >
                          −
                        </button>
                        <input
                          className="qty-input"
                          inputMode="numeric"
                          value={amount}
                          onChange={(event) => {
                            const next = Number(event.target.value)
                            if (!Number.isFinite(next)) return
                            setQty((current) => ({
                              ...current,
                              [product.id]: Math.min(400, Math.max(1, Math.round(next))),
                            }))
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setQty((current) => ({
                              ...current,
                              [product.id]: Math.min(400, amount + 1),
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="send"
                        onClick={() => {
                          cart.add(product.id, amount)
                          setNotice(`${amount} ${product.name} masuk troli.`)
                        }}
                      >
                        Tambah
                      </button>
                      {agent.rank === "ejen" && supplier ? (
                        <button
                          type="button"
                          className="text-button"
                          disabled={supplierStock < amount}
                          onClick={() => {
                            if (!session.demo) {
                              setNotice(
                                "Belian inventori orang lain disahkan oleh pemegang stok. Gunakan contoh untuk melihat aliran itu.",
                              )
                              return
                            }
                            const result = buyFromInventory(
                              session.demo,
                              agent.id,
                              product.id,
                              amount,
                            )
                            setNotice(
                              result.ok
                                ? `${amount} ${product.name} menunggu ${supplier.name} sahkan bayaran.`
                                : result.error,
                            )
                            refresh()
                          }}
                        >
                          Dari inventori
                        </button>
                      ) : null}
                      {agent.rank === "ejen" && own > 0 ? (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            if (!session.demo) {
                              setNotice("Rekod jualan menggunakan stok yang sudah disahkan rumah.")
                              return
                            }
                            const result = recordRetail(session.demo, agent.id, product.id)
                            setNotice(
                              result.ok
                                ? `Jualan direkod. Margin anda ${rm(result.margin)}.`
                                : result.error,
                            )
                            refresh()
                          }}
                        >
                          Rekod jualan
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <Link className="text-link" to="/masuk">
                      Masuk untuk beli
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
        {notice ? <p className="shop-note">{notice}</p> : null}
        {agent && cart.count > 0 ? (
          <p className="quiet">
            <Link to="/troli">Troli · {cart.count}</Link>
          </p>
        ) : null}
        <p className="quiet">
          Satu resit. Bawah {rm(RECEIPT_AGEN)} harga pasaran. {rm(RECEIPT_AGEN)} harga agen.{" "}
          {rm(RECEIPT_STOCKIST)} harga stockist. {rm(RECEIPT_MASTER)} harga master. Harga murah
          tidak kekal pada belian seterusnya. Pendaftaran tidak menghasilkan wang.
        </p>
      </section>
    </article>
  )
}
