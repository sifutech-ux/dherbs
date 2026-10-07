import {
  RECEIPT_STOCKIST,
  findProduct,
  quoteReceipt,
  unitPrice,
  type Rank,
  type SignupRank,
  type Tier,
} from "./catalog"

export type Agent = {
  id: string
  name: string
  phone: string
  pin: string
  code: string
  rank: Rank
  /** Jika diisi, ejen boleh beli inventori orang ini. Belian syarikat tidak membayarnya. */
  supplierId: string | null
  createdAt: string
}

export type Order = {
  id: string
  buyerId: string
  productId: string
  /** Harga seunit yang pembeli bayar. */
  price: number
  qty: number
  source: "rumah" | "inventori"
  supplierId: string | null
  tier: Tier
  at: string
}

export type Sale = {
  id: string
  agentId: string
  productId: string
  /** Beza harga pada barang yang ejen ini sendiri jual. */
  amount: number
  qty: number
  note: string
  at: string
  kind: "runcit" | "borong"
}

export type DropshipOrder = {
  id: string
  agentId: string
  productId: string
  customer: string
  phone: string
  address: string
  qty: number
  housePrice: number
  margin: number
  status: "rumah-menghantar"
  at: string
}

export type DB = {
  agents: Agent[]
  orders: Order[]
  sales: Sale[]
  dropships: DropshipOrder[]
}

const KEY = "dherbs-house-v4"
const DEMO_KEY = "dherbs-demo-v5"
const SESSION_KEY = "dherbs-session-v1"

function empty(): DB {
  return { agents: [], orders: [], sales: [], dropships: [] }
}

function isRank(value: unknown): value is Rank {
  return value === "ejen" || value === "dropship"
}

function read(key: string): DB {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as DB
    return {
      agents: (parsed.agents ?? []).filter((agent) => isRank(agent.rank)),
      orders: parsed.orders ?? [],
      sales: parsed.sales ?? [],
      dropships: parsed.dropships ?? [],
    }
  } catch {
    return empty()
  }
}

function write(key: string, db: DB) {
  localStorage.setItem(key, JSON.stringify(db))
}

export type Session = { id: string; demo: boolean }

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed.id) return null
    return { id: parsed.id, demo: Boolean(parsed.demo) }
  } catch {
    return null
  }
}

export function setSession(session: Session | null) {
  if (!session) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function keyFor(demo: boolean) {
  return demo ? DEMO_KEY : KEY
}

export function loadDB(demo: boolean) {
  return read(keyFor(demo))
}

function commit(demo: boolean, db: DB) {
  write(keyFor(demo), db)
  return db
}

function uid() {
  return crypto.randomUUID()
}

function makeCode(name: string, taken: Set<string>) {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "EJN"
  let code = ""
  do {
    code = `${base}${Math.floor(10 + Math.random() * 89)}`
  } while (taken.has(code))
  return code
}

function units(qty: number) {
  if (!Number.isInteger(qty) || qty < 1 || qty > 400) return null
  return qty
}

export function registerAgent(
  demo: boolean,
  input: { name: string; phone: string; pin: string; rank: SignupRank; stokisCode: string },
) {
  const db = loadDB(demo)
  const name = input.name.trim()
  const phone = input.phone.replace(/\s+/g, "")
  const pin = input.pin.trim()
  const stokisCode = input.stokisCode.trim().toUpperCase()
  if (input.rank !== "ejen" && input.rank !== "dropship") {
    return { ok: false as const, error: "Pangkat ini tidak dibuka pada borang." }
  }
  if (name.length < 2) return { ok: false as const, error: "Nama perlu diisi." }
  if (phone.length < 9) return { ok: false as const, error: "Nombor telefon perlu diisi." }
  if (!/^\d{4}$/.test(pin)) return { ok: false as const, error: "PIN ialah 4 digit." }
  if (db.agents.some((agent) => agent.phone === phone)) {
    return { ok: false as const, error: "Nombor ini sudah ada akaun." }
  }
  let supplierId: string | null = null
  if (input.rank === "ejen" && stokisCode) {
    const supplier = db.agents.find((agent) => agent.code === stokisCode)
    if (!supplier) return { ok: false as const, error: "Kod inventori tidak dijumpai." }
    if (supplier.rank !== "ejen") return { ok: false as const, error: "Kod ini bukan pemegang inventori." }
    supplierId = supplier.id
  }
  const agent: Agent = {
    id: uid(),
    name,
    phone,
    pin,
    code: makeCode(name, new Set(db.agents.map((item) => item.code))),
    rank: input.rank,
    supplierId,
    createdAt: new Date().toISOString(),
  }
  db.agents.push(agent)
  commit(demo, db)
  return { ok: true as const, agent }
}

export function signIn(demo: boolean, phone: string, pin: string) {
  const db = loadDB(demo)
  const agent = db.agents.find(
    (item) => item.phone === phone.replace(/\s+/g, "") && item.pin === pin.trim(),
  )
  if (!agent) return { ok: false as const, error: "Telefon atau PIN tidak sepadan." }
  return { ok: true as const, agent }
}

export function stockCount(db: DB, agentId: string, productId: string) {
  const incoming = db.orders
    .filter((order) => order.buyerId === agentId && order.productId === productId)
    .reduce((sum, order) => sum + order.qty, 0)
  const retail = db.sales
    .filter(
      (sale) => sale.agentId === agentId && sale.productId === productId && sale.kind === "runcit",
    )
    .reduce((sum, sale) => sum + sale.qty, 0)
  const wholesale = db.orders
    .filter((order) => order.supplierId === agentId && order.productId === productId)
    .reduce((sum, order) => sum + order.qty, 0)
  return incoming - retail - wholesale
}

export function profitOf(db: DB, agentId: string) {
  const amount = db.sales
    .filter((sale) => sale.agentId === agentId)
    .reduce((sum, sale) => sum + sale.amount, 0)
  return Math.round(amount * 100) / 100
}

function round2(amount: number) {
  return Math.round(amount * 100) / 100
}

/** Kos set yang seterusnya keluar, mengikut resit yang paling dahulu. */
export function fifoCost(db: DB, agentId: string, productId: string, qty: number) {
  const lots = db.orders
    .filter((order) => order.buyerId === agentId && order.productId === productId)
    .slice()
    .sort((a, b) => a.at.localeCompare(b.at))
  let skip =
    db.sales
      .filter(
        (sale) => sale.agentId === agentId && sale.productId === productId && sale.kind === "runcit",
      )
      .reduce((sum, sale) => sum + sale.qty, 0) +
    db.orders
      .filter((order) => order.supplierId === agentId && order.productId === productId)
      .reduce((sum, order) => sum + order.qty, 0)
  let need = qty
  let cost = 0
  for (const lot of lots) {
    let available = lot.qty
    if (skip > 0) {
      const used = Math.min(skip, available)
      skip -= used
      available -= used
    }
    if (available > 0 && need > 0) {
      const take = Math.min(need, available)
      cost += take * lot.price
      need -= take
    }
  }
  if (need > 0) return null
  return round2(cost)
}

function pricedLines(lines: { productId: string; qty: number }[]) {
  const priced: { product: NonNullable<ReturnType<typeof findProduct>>; qty: number }[] = []
  for (const line of lines) {
    const product = findProduct(line.productId)
    const qty = units(line.qty)
    if (!product || !qty) return null
    priced.push({ product, qty })
  }
  return priced
}

/** Troli dari syarikat. Harga ikut jumlah resit ini sahaja. Tiada kredit kepada orang lain. */
export function checkoutCompany(
  demo: boolean,
  agentId: string,
  lines: { productId: string; qty: number }[],
) {
  if (lines.length === 0) return { ok: false as const, error: "Troli kosong." }
  const db = loadDB(demo)
  const agent = db.agents.find((item) => item.id === agentId)
  if (!agent) return { ok: false as const, error: "Akaun tidak dijumpai." }
  if (agent.rank !== "ejen") {
    return { ok: false as const, error: "Troli stok ini untuk ejen. Dropship mengisi alamat pelanggan." }
  }
  const priced = pricedLines(lines)
  if (!priced) return { ok: false as const, error: "Kuantiti tidak sah." }
  const quote = quoteReceipt(priced)
  const at = new Date().toISOString()
  for (const line of priced) {
    db.orders.push({
      id: uid(),
      buyerId: agent.id,
      productId: line.product.id,
      price: unitPrice(line.product, quote.tier),
      qty: line.qty,
      source: "rumah",
      supplierId: null,
      tier: quote.tier,
      at,
    })
  }
  commit(demo, db)
  return { ok: true as const, tier: quote.tier, total: quote.total }
}

/** Beli dari inventori seseorang. Harga rak agen. Penjual untung pada kos set itu. */
export function buyFromInventory(demo: boolean, agentId: string, productId: string, qty = 1) {
  const product = findProduct(productId)
  const unitsToBuy = units(qty)
  if (!product || !unitsToBuy) return { ok: false as const, error: "Produk tidak dijumpai." }
  const db = loadDB(demo)
  const agent = db.agents.find((item) => item.id === agentId)
  if (!agent) return { ok: false as const, error: "Akaun tidak dijumpai." }
  if (agent.rank !== "ejen" || !agent.supplierId) {
    return { ok: false as const, error: "Inventori belum dipautkan pada akaun ini." }
  }
  const supplier = db.agents.find((item) => item.id === agent.supplierId)
  if (!supplier || supplier.rank !== "ejen") {
    return { ok: false as const, error: "Pemegang inventori tidak dijumpai." }
  }
  if (stockCount(db, supplier.id, product.id) < unitsToBuy) {
    return { ok: false as const, error: "Inventori ini belum ada set secukupnya." }
  }
  const cost = fifoCost(db, supplier.id, product.id, unitsToBuy)
  if (cost == null) return { ok: false as const, error: "Kos inventori tidak dijumpai." }
  const price = unitPrice(product, "agen")
  const amount = round2(price * unitsToBuy - cost)
  if (amount < 0) {
    return { ok: false as const, error: "Harga rak lebih rendah daripada kos set ini." }
  }
  const at = new Date().toISOString()
  db.orders.push({
    id: uid(),
    buyerId: agent.id,
    productId: product.id,
    price,
    qty: unitsToBuy,
    source: "inventori",
    supplierId: supplier.id,
    tier: "agen",
    at,
  })
  db.sales.push({
    id: uid(),
    agentId: supplier.id,
    productId: product.id,
    amount,
    qty: unitsToBuy,
    note: `Inventori kepada ${agent.name} · ${product.name}`,
    at,
    kind: "borong",
  })
  commit(demo, db)
  return { ok: true as const, amount }
}

export function recordRetail(demo: boolean, agentId: string, productId: string) {
  const product = findProduct(productId)
  if (!product) return { ok: false as const, error: "Produk tidak dijumpai." }
  const db = loadDB(demo)
  const agent = db.agents.find((item) => item.id === agentId)
  if (!agent) return { ok: false as const, error: "Akaun tidak dijumpai." }
  if (agent.rank !== "ejen") {
    return { ok: false as const, error: "Dropship mengisi pesanan. Rumah yang menghantar." }
  }
  if (stockCount(db, agent.id, product.id) < 1) {
    return { ok: false as const, error: "Tiada stok untuk dijual." }
  }
  const cost = fifoCost(db, agent.id, product.id, 1)
  if (cost == null) return { ok: false as const, error: "Kos set tidak dijumpai." }
  const margin = round2(product.sell - cost)
  if (margin < 0) return { ok: false as const, error: "Kos set ini melebihi harga pasaran." }
  db.sales.push({
    id: uid(),
    agentId: agent.id,
    productId: product.id,
    amount: margin,
    qty: 1,
    note: `Runcit · ${product.name}`,
    at: new Date().toISOString(),
    kind: "runcit",
  })
  commit(demo, db)
  return { ok: true as const, margin }
}

/** Troli dropship. Harga ikut resit. Rumah menghantar. Inventori orang lain tidak dibayar. */
export function checkoutDropship(
  demo: boolean,
  agentId: string,
  lines: { productId: string; qty: number }[],
  input: { customer: string; phone: string; address: string },
) {
  if (lines.length === 0) return { ok: false as const, error: "Troli kosong." }
  const customer = input.customer.trim()
  const phone = input.phone.replace(/\s+/g, "")
  const address = input.address.trim()
  if (customer.length < 2) return { ok: false as const, error: "Nama pelanggan perlu diisi." }
  if (phone.length < 9) return { ok: false as const, error: "Telefon pelanggan perlu diisi." }
  if (address.length < 8) return { ok: false as const, error: "Alamat penghantaran perlu diisi." }
  const db = loadDB(demo)
  const agent = db.agents.find((item) => item.id === agentId)
  if (!agent) return { ok: false as const, error: "Akaun tidak dijumpai." }
  if (agent.rank !== "dropship") {
    return { ok: false as const, error: "Pesanan penghantaran rumah ialah untuk dropship." }
  }
  const priced = pricedLines(lines)
  if (!priced) return { ok: false as const, error: "Kuantiti tidak sah." }
  const quote = quoteReceipt(priced)
  const at = new Date().toISOString()
  for (const line of priced) {
    const unit = unitPrice(line.product, quote.tier)
    db.dropships.push({
      id: uid(),
      agentId: agent.id,
      productId: line.product.id,
      customer,
      phone,
      address,
      qty: line.qty,
      housePrice: round2(unit * line.qty),
      margin: round2((line.product.sell - unit) * line.qty),
      status: "rumah-menghantar",
      at,
    })
  }
  commit(demo, db)
  return { ok: true as const, tier: quote.tier, total: quote.total }
}

export function openContoh() {
  const createdAt = "2026-10-01T02:00:00.000Z"
  const db = empty()
  db.agents = [
    {
      id: "farah",
      name: "Farah",
      phone: "60190000001",
      pin: "2468",
      code: "FARA24",
      rank: "ejen",
      supplierId: null,
      createdAt,
    },
    {
      id: "hana",
      name: "Hana",
      phone: "60190000002",
      pin: "2468",
      code: "HANA18",
      rank: "ejen",
      supplierId: "farah",
      createdAt,
    },
    {
      id: "rizal",
      name: "Rizal",
      phone: "60190000003",
      pin: "2468",
      code: "RIZA30",
      rank: "dropship",
      supplierId: null,
      createdAt,
    },
  ]
  write(DEMO_KEY, db)
  let qty = 1
  const kecil = findProduct("kecil")
  if (kecil) {
    while (unitPrice(kecil, "stockist") * qty < RECEIPT_STOCKIST) qty += 1
  }
  checkoutCompany(true, "farah", [{ productId: "kecil", qty }])
  recordRetail(true, "farah", "kecil")
  buyFromInventory(true, "hana", "kecil", 1)
  checkoutCompany(true, "hana", [{ productId: "kecil", qty: 1 }])
  checkoutDropship(
    true,
    "rizal",
    [{ productId: "kecil", qty: 1 }],
    {
      customer: "Aina",
      phone: "0123456789",
      address: "Contoh alamat penghantaran",
    },
  )
  setSession({ id: "farah", demo: true })
}
