import { useRoute } from './router'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import InscricaoPage from './pages/InscricaoPage'
import CamisasPage from './CamisasPage'
import ReiRainhaPage from './pages/ReiRainhaPage'
import VotacaoPage from './pages/VotacaoPage'

const paginas = {
  '/': Home,
  '/inscricao': InscricaoPage,
  '/camisas': CamisasPage,
  '/rei-e-rainha': ReiRainhaPage,
  '/votacao': VotacaoPage,
}

export default function App() {
  const route = useRoute()
  const Pagina = paginas[route]

  return (
    <div className="min-h-screen bg-night">
      <Nav route={route} />
      <Pagina />
      <Footer />
    </div>
  )
}
