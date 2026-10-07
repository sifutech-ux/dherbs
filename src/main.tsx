import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@fontsource/instrument-serif/400.css"
import "@fontsource/instrument-serif/400-italic.css"
import "@fontsource/outfit/400.css"
import "@fontsource/outfit/500.css"
import "@fontsource/outfit/600.css"
import App from "./App.tsx"
import "./styles.css"
import "./dherbs.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
