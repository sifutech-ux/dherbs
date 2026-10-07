import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import { copy, type Copy, type Lang } from "./copy"

const STORAGE_KEY = "la-lang"

type LanguageContextValue = {
  lang: Lang
  setLang: Dispatch<SetStateAction<Lang>>
  t: Copy
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "en" || stored === "bm") return stored
  } catch {
    /* private mode */
  }
  return "bm"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readLang)

  useEffect(() => {
    document.documentElement.lang = lang === "bm" ? "ms" : "en"
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* private mode */
    }
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: copy[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error("useLanguage must be used within LanguageProvider")
  return value
}
