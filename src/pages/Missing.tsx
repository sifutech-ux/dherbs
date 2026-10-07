import { Link } from "react-router-dom"
import { useLanguage } from "../i18n"

export function Missing() {
  const { t } = useLanguage()

  return (
    <article className="page">
      <header className="page-head wrap narrow">
        <p className="section-label">404</p>
        <h1>{t.missing.title}</h1>
        <p className="lede">{t.missing.body}</p>
        <Link className="text-link" to="/la">
          {t.missing.cta}
        </Link>
      </header>
    </article>
  )
}
