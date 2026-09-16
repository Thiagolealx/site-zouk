import { useState, useEffect } from 'react'
import { Link } from '../router'

const itens = [
  { label: 'Início', to: '/', path: '/' },
  { label: 'Destaques', to: '/#o-que-te-espera' },
  { label: 'Lineup', to: '/#lineup' },
  { label: 'Alto Mar', to: '/#alto-mar' },
  { label: 'Ingressos', to: '/ingressos', path: '/ingressos' },
  { label: 'Inscrição', to: '/inscricao', path: '/inscricao' },
  { label: 'Camisas', to: '/camisas', path: '/camisas' },
]

export default function Nav({ route }) {
  const [scrolled, setScrolled] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Trocou de rota pelo menu: fecha o painel.
  useEffect(() => setAberto(false), [route])

  const estiloItem = (item) =>
    item.path === route
      ? 'text-sand bg-night-hover'
      : 'text-mist hover:text-sand hover:bg-night-hover'

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[90] backdrop-blur-[14px] border-b transition-colors duration-300 ${
        scrolled ? 'bg-night-deep/95 border-line' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-6 py-3.5 flex items-center gap-7">
        <Link
          to="/"
          className="flex-1 font-display text-xl tracking-wider text-sand uppercase whitespace-nowrap"
        >
          Zouk Jampa
        </Link>

        <div className="hidden min-[900px]:flex items-center justify-center gap-1">
          {itens.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`px-3 py-2.5 rounded-full text-[14.5px] font-semibold whitespace-nowrap transition-colors ${estiloItem(item)}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-end gap-2">
          <Link
            to="/ingressos"
            className="px-[18px] py-2.5 rounded-full text-[14.5px] font-bold text-night bg-sunset-gradient whitespace-nowrap hover:brightness-110 transition-[filter]"
          >
            Garantir vaga
          </Link>
          <button
            type="button"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={aberto}
            onClick={() => setAberto((v) => !v)}
            className="min-[900px]:hidden w-11 h-11 rounded-xl border border-line bg-night-light text-sand text-lg leading-none hover:bg-night-hover transition-colors"
          >
            {aberto ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {aberto && (
        <div className="min-[900px]:hidden border-t border-line bg-night-deep/95 px-4 pt-2.5 pb-4 grid gap-1">
          {itens.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`px-3.5 py-3 rounded-xl text-base font-semibold transition-colors ${estiloItem(item)}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
