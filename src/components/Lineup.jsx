import { useState } from 'react'

const artistas = [
  { nome: 'Bruna Peçanha',     foto: '/assets/lineup/Artistas/Bruna Peçanha.jpg' },
  { nome: 'Dan e Barros',      foto: '/assets/lineup/Artistas/Dan e Barros.jpg' },
  { nome: 'Imaculada Gadelha', foto: '/assets/lineup/Artistas/Imaculada Gadelha.jpg' },
  { nome: 'Jeferson e Kaylane',foto: '/assets/lineup/Artistas/Jeferson e Kaylane.jpg' },
  { nome: 'Lucas e Thayná',    foto: '/assets/lineup/Artistas/Lucas e Thayná.jpg' },
  { nome: 'Rian e Evelin',     foto: '/assets/lineup/Artistas/Rian e Evelin.jpg' },
  { nome: 'Victor e Rosa',     foto: '/assets/lineup/Artistas/Victor e Rosa.jpg' },
  { nome: 'Viniel e Luanna',   foto: '/assets/lineup/Artistas/Viniel e Luanna.jpg' },
]

const djs = [
  { nome: 'DJ Auler',       foto: '/assets/lineup/Djs/Dj Auler.jpg' },
  { nome: 'DJ Gabs',        foto: '/assets/lineup/Djs/Dj Gabs.jpg' },
  { nome: 'DJ Pedro Lucas', foto: '/assets/lineup/Djs/Dj Pedro Lucas.jpg' },
  { nome: 'DJ Santtus',     foto: '/assets/lineup/Djs/Dj Santtus.jpg' },
  { nome: 'DJ WB',          foto: '/assets/lineup/Djs/Dj WB.jpg' },
  { nome: 'DJ Zen Eyes',    foto: '/assets/lineup/Djs/Dj Zen Eyes.jpg' },
]

function PersonCard({ nome, foto }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="group cursor-default">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-sun-orange/20 hover:border-sun-orange/55 hover:scale-105 transition-all duration-300 bg-night-light">
        {!imgError ? (
          <>
            <img
              src={foto}
              alt={nome}
              className="absolute inset-0 w-full h-full object-cover object-top"
              onError={() => setImgError(true)}
            />
            {/* Gradient: escurece topo e rodapé para fundir o fundo laranja dos flyers com o tema dark */}
            <div className="absolute inset-0 bg-gradient-to-b from-night/65 via-transparent to-night/85 pointer-events-none" />
            {/* Vinheta radial nas bordas laterais */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(14,42,50,0.6) 100%)' }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sand/20 text-5xl select-none">♪</span>
          </div>
        )}
      </div>
      <p className="text-center font-body text-sand/80 mt-2 text-sm font-medium tracking-wide">
        {nome}
      </p>
    </div>
  )
}

export default function Lineup() {
  return (
    <section className="py-16 md:py-20 bg-night">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-5xl md:text-7xl text-sand tracking-widest">
            LINEUP
          </h2>
          <p className="font-script text-xl md:text-2xl text-sun-yellow mt-2">
            {artistas.length + djs.length} artistas e {djs.length} DJs
          </p>
        </div>

        <div className="mb-14">
          <h3 className="font-display text-xl text-sand/40 tracking-widest mb-6 text-center">
            ARTISTAS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {artistas.map((a, i) => (
              <PersonCard key={i} nome={a.nome} foto={a.foto} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl text-sand/40 tracking-widest mb-6 text-center">
            DJS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {djs.map((d, i) => (
              <PersonCard key={i} nome={d.nome} foto={d.foto} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
