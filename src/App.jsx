import { useRoute } from './router'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import InscricaoPage from './pages/InscricaoPage'
import CamisasPage from './CamisasPage'

const paginas = {
  '/': Home,
  '/inscricao': InscricaoPage,
  '/camisas': CamisasPage,
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
