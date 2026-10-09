import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { catalog, rankLabel, rm, tierLabel } from "./catalog"
import { rumahCall } from "./remote"
import { Shop } from "./Shop"
import { useHouse } from "./session"
import { confirmInventory, confirmReceipt, fifoCost, markShipped, profitOf, stockCount } from "./store"

export function Gate({ children }: { children: ReactNode }) {
  const { session } = useHouse()
  if (!session) return <Navigate to="/masuk" replace />
  return children
}

export function Kedai() {
  return <Shop agentView />
}

export function Pesanan() {
  const { session, db, refresh } = useHouse()
  const agent = db.agents.find((item) => item.id === session?.id)
  if (!session || !agent) return null
  if (agent.rank !== "rumah") {
    return <p className="quiet wrap page">Meja ini untuk rumah.</p>
  }
  const receipts = new Map<string, typeof db.orders>()
  for (const order of db.orders) {
    if (order.source !== "rumah" || order.status !== "menunggu-bayaran") continue
    const list = receipts.get(order.receiptId) ?? []
    list.push(order)
    receipts.set(order.receiptId, list)
  }
  const waitingShips = db.dropships.filter((order) => order.status === "menunggu-bayaran")

  return (
    <article className="page wallet">
      <header className="page-head wrap">
        <p className="section-label">Rumah</p>
        <h1>Pesanan menunggu.</h1>
        <p className="lede">
          Sahkan bayaran dahulu. Stok ejen hanya dikira selepas wang syarikat masuk. Tiada
          komisen untuk pendaftaran.
        </p>
      </header>
      <section className="wrap">
        {[...receipts.entries()].length === 0 ? (
          <p className="quiet">Tiada resit syarikat yang menunggu.</p>
        ) : (
          <ul className="tx">
            {[...receipts.entries()].map(([receiptId, lines]) => {
              const buyer = db.agents.find((item) => item.id === lines[0]?.buyerId)
              const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0)
              return (
                <li key={receiptId}>
                  <span className="tx-mark">R</span>
                  <p>
                    <strong>{buyer?.name ?? "Ejen"}</strong>
                    <small>
                      {lines.map((line) => `${line.qty} ${catalog.find((item) => item.id === line.productId)?.name}`).join(", ")}
                      {" · "}
                      {tierLabel(lines[0].tier)}
                    </small>
                  </p>
                  <button
                    type="button"
                    className="text-button"
                    onClick={async () => {
                      if (session.demo) confirmReceipt(true, agent.id, receiptId)
                      else if (session.token) await rumahCall("sahkan", { receiptId }, session.token)
                      refresh()
                    }}
                  >
                    Sahkan {rm(total)}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <h2>Dropship</h2>
        {waitingShips.length === 0 ? (
          <p className="quiet">Tiada penghantaran yang menunggu.</p>
        ) : (
          <ul className="tx">
            {waitingShips.map((order) => (
              <li key={order.id}>
                <span className="tx-mark">H</span>
                <p>
                  <strong>{order.customer}</strong>
                  <small>
                    {order.address} · Rumah terima {rm(order.housePrice)}
                  </small>
                </p>
                <button
                  type="button"
                  className="text-button"
                  onClick={async () => {
                    if (session.demo) markShipped(true, agent.id, order.id)
                    else if (session.token) await rumahCall("hantar", { orderId: order.id }, session.token)
                    refresh()
                  }}
                >
                  Sudah dihantar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}

export function Stok() {
  const { session, db, refresh } = useHouse()
  const agent = db.agents.find((item) => item.id === session?.id)
  if (!session) return null
  if (!agent) {
    return (
      <p className="quiet wrap page">
        Contoh ini telah dikemas kini. Buka semula dari halaman masuk.
      </p>
    )
  }

  const supplier = agent.supplierId
    ? db.agents.find((item) => item.id === agent.supplierId)
    : undefined
  const shipments = db.dropships.filter((order) => order.agentId === agent.id)

  return (
    <article className="page board-page">
      <header className="page-head wrap">
        <p className="section-label">{session.demo ? "Contoh" : "Stok"}</p>
        <h1>{rankLabel(agent.rank)}.</h1>
        <p className="lede">
          {agent.rank === "dropship"
            ? "Anda tidak memegang stok. Rumah yang membungkus dan menghantar pesanan pelanggan."
            : supplier
              ? `Set di tangan anda. Anda juga boleh membeli inventori ${supplier.name} pada harga agen.`
              : "Set di tangan anda. Untung hanya bila set ini keluar kepada pembeli."}
        </p>
      </header>
      <section className="wrap board">
        <article className="you-block">
          <span>{initials(agent.name)}</span>
          <p>
            <strong>{agent.name}</strong>
            <small>{rankLabel(agent.rank)}</small>
          </p>
          {agent.rank === "ejen" ? (
            <em>Kod {agent.code}</em>
          ) : (
            <em>{shipments.length} pesanan</em>
          )}
        </article>
        {agent.rank === "dropship" ? (
          <ul className="tx">
            {shipments.map((order) => {
              const product = catalog.find((item) => item.id === order.productId)
              return (
                <li key={order.id}>
                  <span className="tx-mark">H</span>
                  <p>
                    <strong>{order.customer}</strong>
                    <small>
                      {product?.name} · Rumah menghantar · Bayar rumah {rm(order.housePrice)}
                    </small>
                  </p>
                  <em>+{rm(order.margin)}</em>
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="stock-list">
            {catalog.map((product) => {
              const onHand = stockCount(db, agent.id, product.id)
              return (
                <li key={product.id}>
                  <strong>{product.name}</strong>
                  <b>{onHand}</b>
                  <small>
                    di tangan
                    {onHand > 0 ? ` · kos ${rm(fifoCost(db, agent.id, product.id, 1) ?? 0)}` : ""}
                  </small>
                </li>
              )
            })}
          </ul>
        )}
        {agent.rank === "ejen" ? (
          <ul className="tx">
            {db.orders
              .filter((order) => order.supplierId === agent.id && order.status === "menunggu-bayaran")
              .map((order) => {
                const buyer = db.agents.find((item) => item.id === order.buyerId)
                const product = catalog.find((item) => item.id === order.productId)
                return (
                  <li key={order.id}>
                    <span className="tx-mark">{order.qty}</span>
                    <p>
                      <strong>{buyer?.name}</strong>
                      <small>
                        {product?.name} · Menunggu anda sahkan bayaran · {rm(order.price)}
                      </small>
                    </p>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => {
                        confirmInventory(session.demo, agent.id, order.id)
                        refresh()
                      }}
                    >
                      Sahkan
                    </button>
                  </li>
                )
              })}
          </ul>
        ) : null}
        <p className="quiet">
          {agent.rank === "ejen"
            ? `Beri kod ${agent.code} kepada orang yang membeli inventori ini. Belian mereka terus dari syarikat tidak masuk ke dompet anda.`
            : "Untung pesanan ialah beza harga pada resit itu, dikutip daripada pelanggan."}
        </p>
      </section>
    </article>
  )
}

export function Dompet() {
  const { session, db } = useHouse()
  const agent = db.agents.find((item) => item.id === session?.id)
  if (!session) return null
  if (!agent) {
    return (
      <p className="quiet wrap page">
        Contoh ini telah dikemas kini. Buka semula dari halaman masuk.
      </p>
    )
  }

  const sales = db.sales
    .filter((sale) => sale.agentId === agent.id)
    .slice()
    .reverse()
  const shipments = db.dropships.filter((order) => order.agentId === agent.id)
  const collected = shipments.reduce((sum, order) => sum + order.margin, 0)
  const due = shipments.reduce((sum, order) => sum + order.housePrice, 0)
  const profit = agent.rank === "dropship" ? collected : profitOf(db, agent.id)

  return (
    <article className="page wallet">
      <section className="wrap">
        <article className="wallet-card">
          <p>{session.demo ? "Dompet contoh" : "Untung anda"}</p>
          <p className="wallet-balance">{rm(profit)}</p>
          <p className="wallet-pending">
            {agent.rank === "dropship"
              ? `Dikutip daripada pelanggan. Perlu dibayar kepada rumah ${rm(due)}.`
              : "Hanya set yang keluar dari inventori anda. Belian syarikat tidak masuk ke sini."}
          </p>
        </article>
        <h2>Penyata</h2>
        {agent.rank === "dropship" ? (
          shipments.length === 0 ? (
            <p className="quiet">Belum ada pesanan.</p>
          ) : (
            <ul className="tx">
              {shipments
                .slice()
                .reverse()
                .map((order) => {
                  const product = catalog.find((item) => item.id === order.productId)
                  return (
                    <li key={order.id}>
                      <span className="tx-mark">P</span>
                      <p>
                        <strong>{order.customer}</strong>
                        <small>
                          {product?.name} · Bayar rumah {rm(order.housePrice)} · Rumah menghantar
                        </small>
                      </p>
                      <em>+{rm(order.margin)}</em>
                    </li>
                  )
                })}
            </ul>
          )
        ) : sales.length === 0 ? (
          <p className="quiet">Belum ada jualan. Untung masuk apabila set di tangan anda terjual.</p>
        ) : (
          <ul className="tx">
            {sales.map((sale) => (
              <li key={sale.id}>
                <span className="tx-mark">{sale.kind === "borong" ? "B" : "R"}</span>
                <p>
                  <strong>{sale.kind === "borong" ? "Jualan borong" : "Jualan runcit"}</strong>
                  <small>{sale.note}</small>
                </p>
                <em>+{rm(sale.amount)}</em>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}
