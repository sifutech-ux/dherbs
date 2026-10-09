import type { DB } from "./store"

export type RemoteAgent = { id: string; name: string; rank: string }

type RemoteOk = {
  ok: true
  token?: string
  agent?: RemoteAgent
  db?: DB
  tier?: string
  total?: number
  receiptId?: string
  rumah?: boolean
  error?: never
}

type RemoteFail = { ok: false; error: string }

export async function rumahCall(
  action: string,
  body: Record<string, unknown> = {},
  token?: string,
): Promise<RemoteOk | RemoteFail> {
  const response = await fetch(`/api/index.php?action=${encodeURIComponent(action)}`, {
    method: action === "status" || action === "state" ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Dherbs-Token": token } : {}),
    },
    body: action === "status" || action === "state" ? undefined : JSON.stringify({ ...body, token }),
  })
  const payload = (await response.json()) as RemoteOk | RemoteFail
  if (!response.ok && payload && typeof payload === "object" && "error" in payload) return payload
  return payload
}
