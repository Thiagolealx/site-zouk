import Hero from './components/Hero'
import Countdown from './components/Countdown'
import Highlights from './components/Highlights'
import Lineup from './components/Lineup'
import WaveDivider from './components/WaveDivider'
import Lotes from './components/Lotes'
import Pagamento from './components/Pagamento'
import Inscricao from './components/Inscricao'
import Comunidade from './components/Comunidade'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-night">
      <Hero />
      <Countdown />
      <Highlights />
      <Lineup />
      <WaveDivider />
      <Lotes />
      <Pagamento />
      <WaveDivider flip />
      <Inscricao />
      <Comunidade />
      <Footer />
    </div>
  )
}
