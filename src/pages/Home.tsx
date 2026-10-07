import { Link } from "react-router-dom"
import { useLanguage } from "../i18n"

export function Home() {
  const { t } = useLanguage()

  return (
    <>
      <section className="hero">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="wordmark" aria-label="L and A">
          <span>L</span>
          <span className="amp" aria-hidden="true">
            &amp;
          </span>
          <span>A</span>
        </h1>
        <p className="hero-line">{t.hero}</p>
        <a className="scroll-cue" href="#pelan">
          <span>{t.scroll}</span>
          <i />
        </a>
      </section>

      <section className="plan" id="pelan">
        <div className="wrap">
          <p className="section-label light">{t.plan.label}</p>
          <ol className="plan-list">
            {t.plan.nodes.map((node) => (
              <li key={node.index}>
                <span className="plan-index">{node.index}</span>
                <h2 className="plan-title">{node.title}</h2>
                <p className="plan-body">{node.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="principles">
        <div className="wrap">
          <p className="section-label">{t.principles.label}</p>
          <ol className="principle-list">
            {t.principles.items.map((item) => (
              <li className="principle" key={item.index}>
                <span className="principle-index">{item.index}</span>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="close">
        <div className="wrap close-inner">
          <h2>{t.close.title}</h2>
          <p>{t.close.body}</p>
          <Link className="text-link" to="/la/surat">
            {t.close.cta}
          </Link>
        </div>
      </section>
    </>
  )
}
