import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { CartProvider } from "./dherbs/cart"
import { Enter } from "./dherbs/Enter"
import { Frame } from "./dherbs/Frame"
import { Dompet, Gate, Kedai, Stok } from "./dherbs/Rooms"
import { HouseProvider } from "./dherbs/session"
import { Shop } from "./dherbs/Shop"
import { Troli } from "./dherbs/Troli"
import { LanguageProvider } from "./i18n"
import { Arrangement } from "./pages/Arrangement"
import { Home } from "./pages/Home"
import { Letter } from "./pages/Letter"
import { Mandate } from "./pages/Mandate"
import { Missing } from "./pages/Missing"
import { Note } from "./pages/Note"
import { Shell } from "./Shell"

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <HouseProvider>
          <CartProvider>
          <Routes>
            <Route element={<Frame />}>
              <Route index element={<Shop agentView={false} />} />
              <Route path="masuk" element={<Enter />} />
              <Route path="kedai" element={<Gate><Kedai /></Gate>} />
              <Route path="troli" element={<Gate><Troli /></Gate>} />
              <Route path="stok" element={<Gate><Stok /></Gate>} />
              <Route path="pokok" element={<Navigate to="/stok" replace />} />
              <Route path="dompet" element={<Gate><Dompet /></Gate>} />
            </Route>
            <Route path="la" element={<Shell />}>
              <Route index element={<Home />} />
              <Route path="urusan" element={<Arrangement />} />
              <Route path="amanah" element={<Mandate />} />
              <Route path="surat" element={<Letter />} />
              <Route path="nota" element={<Note />} />
              <Route path="*" element={<Missing />} />
            </Route>
          </Routes>
          </CartProvider>
        </HouseProvider>
      </BrowserRouter>
    </LanguageProvider>
  )
}
