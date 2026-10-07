import { useState, type FormEvent } from "react"
import { house } from "../house"
import { useLanguage } from "../i18n"

type Fields = {
  name: string
  reply: string
  goods: string
  qty: string
  note: string
}

const empty: Fields = { name: "", reply: "", goods: "", qty: "", note: "" }

function compose(
  fields: Fields,
  labels: { name: string; reply: string; goods: string; qty: string; note: string },
  subject: string,
) {
  const lines = [
    "L&A World",
    subject,
    "",
    `${labels.name}: ${fields.name}`,
    `${labels.reply}: ${fields.reply}`,
    `${labels.goods}: ${fields.goods}`,
    `${labels.qty}: ${fields.qty}`,
  ]
  if (fields.note.trim()) lines.push(`${labels.note}: ${fields.note.trim()}`)
  return lines.join("\n")
}

export function Letter() {
  const { t } = useLanguage()
  const [fields, setFields] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, boolean>>>(
    {},
  )
  const [draft, setDraft] = useState("")
  const [copied, setCopied] = useState(false)

  function update(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: false }))
  }

  async function copyDraft(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = {
      name: fields.name.trim() === "",
      reply: fields.reply.trim() === "",
      goods: fields.goods.trim() === "",
      qty: fields.qty.trim() === "",
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const text = compose(
      {
        name: fields.name.trim(),
        reply: fields.reply.trim(),
        goods: fields.goods.trim(),
        qty: fields.qty.trim(),
        note: fields.note,
      },
      {
        name: t.letter.name,
        reply: t.letter.reply,
        goods: t.letter.goods,
        qty: t.letter.qty,
        note: t.letter.note,
      },
      t.letter.subject,
    )
    setDraft(text)
    setCopied(false)
    await copyDraft(text)
    const href = `mailto:${house.email}?subject=${encodeURIComponent(
      `${t.letter.subject} — L&A World`,
    )}&body=${encodeURIComponent(text)}`
    window.location.href = href
  }

  if (draft) {
    return (
      <article className="page">
        <header className="page-head wrap">
          <p className="section-label">{t.letter.label}</p>
          <h1>{t.letter.title}</h1>
          <p className="lede">{t.letter.sent}</p>
        </header>
        <div className="wrap letter-done">
          <p className="section-label">{t.letter.addressLabel}</p>
          <p className="address">{house.email}</p>
          <pre className="letter-proof">{draft}</pre>
          <div className="letter-actions">
            <button
              type="button"
              className="send"
              onClick={() => copyDraft(draft)}
            >
              {copied ? t.letter.copied : t.letter.copy}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setDraft("")
                setFields(empty)
                setCopied(false)
              }}
            >
              {t.letter.another}
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="page">
      <div className="letter-grid wrap">
        <header className="page-head">
          <p className="section-label">{t.letter.label}</p>
          <h1>{t.letter.title}</h1>
          <p className="lede">{t.letter.lede}</p>
          <p className="address-block">
            <span className="section-label">{t.letter.addressLabel}</span>
            <a href={`mailto:${house.email}`}>{house.email}</a>
          </p>
        </header>
        <form className="letter-form" onSubmit={onSubmit} noValidate>
          <Field
            id="name"
            label={t.letter.name}
            hint={t.letter.nameHint}
            value={fields.name}
            error={errors.name ? t.letter.required : ""}
            onChange={(value) => update("name", value)}
            autoComplete="name"
          />
          <Field
            id="reply"
            label={t.letter.reply}
            hint={t.letter.replyHint}
            value={fields.reply}
            error={errors.reply ? t.letter.required : ""}
            onChange={(value) => update("reply", value)}
            autoComplete="email"
          />
          <Field
            id="goods"
            label={t.letter.goods}
            hint={t.letter.goodsHint}
            value={fields.goods}
            error={errors.goods ? t.letter.required : ""}
            onChange={(value) => update("goods", value)}
          />
          <Field
            id="qty"
            label={t.letter.qty}
            hint={t.letter.qtyHint}
            value={fields.qty}
            error={errors.qty ? t.letter.required : ""}
            onChange={(value) => update("qty", value)}
          />
          <Field
            id="note"
            label={t.letter.note}
            hint={t.letter.noteHint}
            value={fields.note}
            onChange={(value) => update("note", value)}
            multiline
          />
          <button className="send" type="submit">
            {t.letter.send}
          </button>
        </form>
      </div>
    </article>
  )
}

function Field({
  id,
  label,
  hint,
  value,
  error,
  onChange,
  autoComplete,
  multiline = false,
}: {
  id: string
  label: string
  hint: string
  value: string
  error?: string
  onChange: (value: string) => void
  autoComplete?: string
  multiline?: boolean
}) {
  const describedBy = error ? `${id}-error` : `${id}-hint`
  return (
    <div className={error ? "field has-error" : "field"}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          value={value}
          placeholder={hint}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          name={id}
          type="text"
          value={value}
          placeholder={hint}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? (
        <small id={`${id}-error`}>{error}</small>
      ) : (
        <small id={`${id}-hint`} className="hint">
          {hint}
        </small>
      )}
    </div>
  )
}
