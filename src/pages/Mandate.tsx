import { useLanguage } from "../i18n"

export function Mandate() {
  const { t } = useLanguage()

  return (
    <article className="page">
      <header className="page-head wrap">
        <p className="section-label">{t.mandate.label}</p>
        <h1>{t.mandate.title}</h1>
        <p className="lede">{t.mandate.lede}</p>
      </header>
      <section className="wrap forms-block">
        <p className="section-label">{t.mandate.formsLabel}</p>
        <ol className="forms">
          {t.mandate.forms.map((form) => (
            <li className="form-card" key={form.index}>
              <span className="plan-index">{form.index}</span>
              <h2>{form.title}</h2>
              <p>{form.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="wrap boundary">
        <p className="section-label">{t.mandate.boundaryLabel}</p>
        <p className="boundary-line">{t.mandate.boundary}</p>
      </section>
    </article>
  )
}
