import { house } from "../house"
import { useLanguage } from "../i18n"

export function Note() {
  const { t } = useLanguage()

  return (
    <article className="page">
      <header className="page-head wrap narrow">
        <p className="section-label">{t.note.label}</p>
        <h1>{t.note.title}</h1>
      </header>
      <div className="prose wrap narrow">
        {t.note.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className="colophon">
          {house.legalName}
          <br />
          {house.domain}
        </p>
      </div>
    </article>
  )
}
