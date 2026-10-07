import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

export type CartLine = { productId: string; qty: number }

type CartValue = {
  lines: CartLine[]
  count: number
  add: (productId: string, qty: number) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const value = useMemo<CartValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0)
    return {
      lines,
      count,
      add: (productId, qty) => {
        const next = Math.min(400, Math.max(1, Math.round(qty)))
        setLines((current) => {
          const found = current.find((line) => line.productId === productId)
          if (!found) return [...current, { productId, qty: next }]
          return current.map((line) =>
            line.productId === productId
              ? { ...line, qty: Math.min(400, line.qty + next) }
              : line,
          )
        })
      },
      setQty: (productId, qty) => {
        setLines((current) =>
          qty < 1
            ? current.filter((line) => line.productId !== productId)
            : current.map((line) =>
                line.productId === productId
                  ? { ...line, qty: Math.min(400, Math.round(qty)) }
                  : line,
              ),
        )
      },
      clear: () => setLines([]),
    }
  }, [lines])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error("useCart must be used within CartProvider")
  return value
}
