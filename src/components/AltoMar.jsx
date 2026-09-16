import { useState, useEffect, useRef } from 'react'
import { Link } from '../router'

const paradas = [
  {
    titulo: 'Areia Vermelha',
    texto: 'Banco de areia que só aparece na maré baixa. Primeira parada, água rasa e o baile começando.',
    src: '/assets/roteiro/areia-vermelha.jpg',
  },
  {
    titulo: 'Ilha da Restinga',
    texto: 'Mangue e água calma. Tempo para banho, foto e respirar antes de voltar para a pista.',
    src: '/assets/roteiro/ilha-restinga.jpg',
  },
  {
    titulo: 'Encontro do Rio Paraíba com o Atlântico',
    texto: 'Duas águas, duas cores. O ponto mais fotografado do passeio.',
    src: '/assets/roteiro/encontro-aguas.jpg',
  },
  {
    titulo: 'Pôr do sol na Praia do Jacaré',
    texto: 'O fim de tarde mais famoso da Paraíba fecha o dia, com o Bolero de Ravel ao vivo.',
    src: '/assets/roteiro/jacare.webp',
  },
]

const bordo = [
  { titulo: 'DJs a bordo', texto: 'Pista montada no deck, com som do começo ao fim do passeio.' },
  { titulo: 'Paradas para banho e contemplação', texto: 'Quatro pontos do litoral, com tempo para cair na água.' },
  { titulo: 'Almoço e bar abertos', texto: 'Serviço a bordo durante todo o trajeto.' },
]

// O vídeo tem ~14 MB, então só carrega quando a pessoa pede pra ver.
// Antes disso fica a foto de capa, que pesa 170 KB.
function Video() {
  const [tocando, setTocando] = useState(false)

  if (tocando) {
    return (
      <video
        src="/assets/alto-mar/baile-alto-mar.mp4"
        poster="/assets/alto-mar/capa-grupo.jpg"
        controls
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTocando(true)}
      className="group relative w-full h-full"
      aria-label="Assistir ao vídeo do baile em alto mar"
    >
      <img
        src="/assets/alto-mar/capa-grupo.jpg"
        alt="Todos os participantes reunidos no catamarã do Zouk Jampa"
        className="w-full h-full object-cover"
      />
      <span className="absolute inset-0 bg-night/35 group-hover:bg-night/20 transition-colors" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center justify-center w-[74px] h-[74px] rounded-full bg-sunset-gradient text-night text-[26px] pl-1 shadow-xl group-hover:scale-110 transition-transform">
          ▶
        </span>
      </span>
    </button>
  )
}

const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const trava = (v) => Math.max(0, Math.min(1, v))

/**
 * Roteiro em tela cheia: cada parada é uma folha que sobe por cima da
 * anterior conforme a página rola. O container é alto (uma tela e pouco por
 * parada) e a cena fica sticky no topo, então a rolagem vira o controle da
 * animação em vez de mover a cena.
 */
function Roteiro() {
  const host = useRef(null)
  const [prog, setProg] = useState(0)

  useEffect(() => {
    let raf = 0

    const medir = () => {
      raf = 0
      const el = host.current
      if (!el) return
      const vao = el.offsetHeight - window.innerHeight
      const bruto = vao > 0 ? -el.getBoundingClientRect().top / vao : 0
      setProg(trava(bruto) * (paradas.length - 1))
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(medir)
    }

    medir()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const atual = Math.round(prog)

  return (
    <div
      ref={host}
      className="mt-[90px] relative"
      style={{ height: `${paradas.length * 105}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-night-deep">
        {paradas.map((parada, i) => {
          // A primeira folha já está posicionada; as outras entram de baixo
          // à medida que a rolagem passa da parada anterior.
          const e = i === 0 ? 1 : suave(trava(prog - (i - 1)))
          const oculto = (1 - e) * 100

          return (
            <div
              key={parada.titulo}
              className="absolute inset-0 will-change-transform"
              style={{ transform: `translate3d(0, ${oculto}%, 0)`, zIndex: 10 + i }}
            >
              <div className="absolute inset-0 overflow-hidden bg-[#0F2E35]">
                <div
                  className="absolute inset-x-0 -inset-y-[12%] will-change-transform"
                  style={{
                    transform: `translate3d(0, ${-oculto * 0.35}%, 0) scale(${1.12 - 0.12 * e})`,
                  }}
                >
                  <img
                    src={parada.src}
                    alt={parada.titulo}
                    className="block w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,35,40,.72)_0%,rgba(11,35,40,.28)_38%,rgba(11,35,40,.88)_100%)]" />
              </div>

              <div className="absolute inset-0 max-w-[1180px] mx-auto flex flex-col justify-end p-[clamp(24px,6vw,88px)]">
                <div
                  className="grid gap-3.5 max-w-[760px]"
                  style={{
                    transform: `translate3d(0, ${oculto * 0.5}px, 0)`,
                    opacity: trava((e - 0.25) / 0.45),
                  }}
                >
                  <span className="font-display text-[15px] tracking-[0.18em] text-sun-yellow">
                    PARADA {String(i + 1).padStart(2, '0')} / {String(paradas.length).padStart(2, '0')}
                  </span>
                  <h3 className="font-display uppercase text-sand text-[clamp(34px,6.5vw,82px)] leading-[0.95] text-balance">
                    {parada.titulo}
                  </h3>
                  <p className="text-[clamp(16px,1.5vw,20px)] leading-[1.5] text-[#E4EEF0] max-w-[560px]">
                    {parada.texto}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        <div className="absolute top-24 inset-x-0 z-40 pointer-events-none">
          <div className="max-w-[1180px] mx-auto px-[clamp(24px,6vw,88px)] flex items-center gap-3.5">
            <span className="text-xs font-bold tracking-[0.18em] uppercase text-sun-yellow">
              Roteiro do dia
            </span>
            <div className="flex-1 flex gap-1.5">
              {paradas.map((parada, i) => (
                <div
                  key={parada.titulo}
                  className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                    i === atual ? 'bg-sun-yellow' : 'bg-[#24484F]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AltoMar() {
  return (
    <section id="alto-mar" className="pt-24 border-t border-rule">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center max-w-[720px] mx-auto">
          <h2 className="font-display uppercase text-sand text-[clamp(34px,5vw,56px)]">
            Baile em alto mar
          </h2>
          <p className="mt-3.5 text-lg leading-[1.55] text-mist">
            Um domingo inteiro de zouk, música e algumas das paisagens mais lindas
            do litoral paraibano.
          </p>
        </div>

        <div className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-6 items-start">
          <div className="rounded-[20px] overflow-hidden border border-line bg-night-light">
            <div className="relative aspect-[16/10] bg-[#0F2E35]">
              <Video />
            </div>
            <div className="px-5 py-[18px] grid gap-1">
              <span className="text-base font-bold text-sand">Assistir ao vídeo</span>
              <span className="text-sm text-haze">edição do passeio de 2025</span>
            </div>
          </div>

          <div className="grid gap-3.5">
            {bordo.map((item) => (
              <div key={item.titulo} className="px-5 py-[18px] rounded-2xl bg-night-light border border-line">
                <p className="text-[17px] font-bold text-sand">{item.titulo}</p>
                <p className="mt-1.5 text-[14.5px] text-haze">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Roteiro />

      <div className="max-w-[1180px] mx-auto px-6 pb-24 text-center">
        <Link
          to="/ingressos"
          className="inline-block px-[30px] py-[15px] rounded-full text-base font-bold text-night bg-sunset-gradient hover:brightness-110 transition-[filter]"
        >
          Quero o passe com catamarã
        </Link>
      </div>
    </section>
  )
}
