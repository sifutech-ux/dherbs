import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { house } from "./house"
import { useLanguage } from "./i18n"

const routes = [
  { to: "/la", key: "house" },
  { to: "/la/urusan", key: "arrangement" },
  { to: "/la/amanah", key: "mandate" },
  { to: "/la/surat", key: "letter" },
  { to: "/la/nota", key: "note" },
] as const

export function Shell() {
  const { t, lang, setLang } = useLanguage()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.title =
      lang === "bm" ? "L&A World — Rumah Belian" : "L&A World — Buying House"
  }, [lang])

  useEffect(() => {
    document.body.classList.toggle("menu-open", open)
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <a className="skip" href="#isi">
        {lang === "bm" ? "Terus ke isi" : "Skip to content"}
      </a>
      <header className="nav">
        <NavLink to="/la" className="brand" aria-label="L&A World" end>
          <span>L</span>
          <span className="brand-amp">&amp;</span>
          <span>A</span>
        </NavLink>
        <nav className="desk" aria-label={t.nav.pages}>
          {routes.map((route) => (
            <NavLink key={route.to} to={route.to} end={route.to === "/la"}>
              {t.nav[route.key]}
            </NavLink>
          ))}
        </nav>
        <div className="nav-end">
          <div className="lang" role="group" aria-label="Language">
            <button
              type="button"
              aria-pressed={lang === "bm"}
              onClick={() => setLang("bm")}
            >
              BM
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="sheet"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t.nav.close : t.nav.menu}
          </button>
        </div>
      </header>

      <div id="sheet" className={open ? "sheet open" : "sheet"} hidden={!open}>
        <nav aria-label={t.nav.pages}>
          <ol>
            {routes.map((route) => (
              <li key={route.to}>
                <NavLink to={route.to} end={route.to === "/la"}>
                  <span>{t.nav[route.key]}</span>
                </NavLink>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <main id="isi">
        <Outlet />
      </main>

      <footer className="foot">
        <div className="wrap foot-inner">
          <p>
            <span>{house.legalName}</span>
            <a href={`https://${house.domain}`}>{house.domain}</a>
          </p>
          <p className="foot-mark">{t.footer.mark}</p>
          <p className="foot-year">{house.year}</p>
        </div>
      </footer>
    </>
  )
}
