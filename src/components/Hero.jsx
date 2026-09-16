import { useState, useEffect } from 'react'
import { Link } from '../router'

const EVENTO = new Date('2026-11-26T18:00:00-03:00')

function restante() {
  const diff = Math.max(0, EVENTO - Date.now())
  return [
    { valor: Math.floor(diff / 86400000), label: 'dias' },
    { valor: Math.floor(diff / 3600000) % 24, label: 'horas' },
    { valor: Math.floor(diff / 60000) % 60, label: 'min' },
    { valor: Math.floor(diff / 1000) % 60, label: 'seg' },
  ]
}

export default function Hero() {
  const [tempo, setTempo] = useState(restante)

  useEffect(() => {
    const id = setInterval(() => setTempo(restante()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header id="inicio" className="relative overflow-hidden bg-hero-glow px-6 pt-[150px] pb-[90px] text-center">
      <div className="max-w-[900px] mx-auto grid gap-[26px] justify-items-center">
        <span className="font-script text-[26px] text-sun-yellow">
          26 a 29 de novembro · João Pessoa — PB
        </span>
        <h1 className="font-display uppercase text-sand text-[clamp(48px,9vw,104px)] leading-[0.92] text-balance">
          Quatro dias de sol,
          <br />
          mar e zouk
        </h1>
        <p className="max-w-[560px] text-[19px] leading-[1.55] text-mist">
          Três bailes, mais de 15 horas de aulas, competição Jack &amp; Jill e um
          domingo inteiro de zouk em alto mar.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/ingressos"
            className="px-[30px] py-[15px] rounded-full text-base font-bold text-night bg-sunset-gradient hover:brightness-110 transition-[filter]"
          >
            Ver ingressos
          </Link>
          <Link
            to="/#lineup"
            className="px-[30px] py-[15px] rounded-full text-base font-bold text-sand border border-[#2A5560] hover:bg-night-hover transition-colors"
          >
            Conhecer o lineup
          </Link>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap gap-3 justify-center">
        {tempo.map((unidade) => (
          <div
            key={unidade.label}
            className="min-w-[96px] px-3 py-4 rounded-2xl bg-night-light border border-line"
          >
            <div className="font-display text-[40px] leading-none text-sun-yellow tabular-nums">
              {String(unidade.valor).padStart(2, '0')}
            </div>
            <div className="mt-1.5 text-xs font-semibold tracking-[0.14em] uppercase text-haze">
              {unidade.label}
            </div>
          </div>
        ))}
      </div>
    </header>
  )
}
