/** Harga contoh. Senarai sebenar menyusul apabila kos pembekal diketahui. */
export const RECEIPT_AGEN = 500
export const RECEIPT_STOCKIST = 5000
export const RECEIPT_MASTER = 15000

export const TIERS = ["master", "stockist", "agen", "pelanggan"] as const
export type Tier = (typeof TIERS)[number]

/** Bahagian harga pasaran yang dibayar pada resit itu. */
export const TIER_RATE: Record<Tier, number> = {
  master: 0.6,
  stockist: 0.7,
  agen: 0.8,
  pelanggan: 1,
}

export const RANKS = ["ejen", "dropship", "rumah"] as const
export type Rank = (typeof RANKS)[number]
export const SIGNUP_RANKS = ["ejen", "dropship"] as const
export type SignupRank = (typeof SIGNUP_RANKS)[number]

export type Product = {
  id: string
  name: string
  line: string
  /** Harga pasaran kepada pelanggan. */
  sell: number
}

export const catalog: Product[] = [
  {
    id: "kecil",
    name: "Set Kecil",
    line: "Lebih kecil daripada bundle pembekal. Cukup untuk bermula.",
    sell: 99,
  },
  {
    id: "rumah",
    name: "Set Rumah",
    line: "Beberapa barang D'Herbs dalam satu set, masih di bawah bundle.",
    sell: 189,
  },
  {
    id: "jualan",
    name: "Set Jualan",
    line: "Untuk ejen yang sudah ada pelanggan, dan mahu stok yang lebih siap.",
    sell: 319,
  },
]

export function findProduct(id: string) {
  return catalog.find((item) => item.id === id)
}

export function rankLabel(rank: Rank) {
  if (rank === "ejen") return "Ejen"
  if (rank === "rumah") return "Rumah"
  return "Dropship"
}

export function tierLabel(tier: Tier) {
  if (tier === "master") return "Master"
  if (tier === "stockist") return "Stockist"
  if (tier === "agen") return "Agen"
  return "Harga pasaran"
}

export function unitPrice(product: Product, tier: Tier) {
  return Math.round(product.sell * TIER_RATE[tier] * 100) / 100
}

export type PricedLine = { product: Product; qty: number }

function pay(lines: PricedLine[], tier: Tier) {
  return (
    Math.round(lines.reduce((sum, line) => sum + unitPrice(line.product, tier) * line.qty, 0) * 100) /
    100
  )
}

/** Harga murah hanya pada resit yang, selepas diskaun itu, masih cukup besar. */
export function quoteReceipt(lines: PricedLine[]) {
  if (lines.length === 0) {
    return { tier: "pelanggan" as Tier, total: 0 }
  }
  const master = pay(lines, "master")
  if (master >= RECEIPT_MASTER) return { tier: "master" as Tier, total: master }
  const stockist = pay(lines, "stockist")
  if (stockist >= RECEIPT_STOCKIST) return { tier: "stockist" as Tier, total: stockist }
  const agen = pay(lines, "agen")
  if (agen >= RECEIPT_AGEN) return { tier: "agen" as Tier, total: agen }
  return { tier: "pelanggan" as Tier, total: pay(lines, "pelanggan") }
}

export function rm(amount: number) {
  return `RM${amount.toFixed(2)}`
}
