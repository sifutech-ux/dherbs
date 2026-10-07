import { Link } from "react-router-dom"
import { useLanguage } from "../i18n"

export function Arrangement() {
  const { t } = useLanguage()

  return (
    <article className="page">
      <header className="page-head wrap">
        <p className="section-label">{t.arrangement.label}</p>
        <h1>{t.arrangement.title}</h1>
        <p className="lede">{t.arrangement.lede}</p>
      </header>
      <ol className="steps wrap">
        {t.arrangement.steps.map((step) => (
          <li className="step" key={step.index}>
            <span className="step-index">{step.index}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="page-end wrap">
        <Link className="text-link" to="/la/surat">
          {t.close.cta}
        </Link>
      </p>
    </article>
  )
}
