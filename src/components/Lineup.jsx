import { useMarquee } from '../hooks/useMarquee'

const grupos = [
  {
    titulo: 'Artistas',
    pessoas: [
      { nome: 'Rian e Evelin', src: '/assets/lineup/Artistas/Rian e Evelin.jpg' },
      { nome: 'Jeferson e Kaylane', src: '/assets/lineup/Artistas/Jeferson e Kaylane.jpg' },
      { nome: 'Viniel e Luanna', src: '/assets/lineup/Artistas/Viniel e Luanna.jpg' },
      { nome: 'Lucas e Thayná', src: '/assets/lineup/Artistas/Lucas e Thayná.jpg' },
      { nome: 'Victor e Rosa', src: '/assets/lineup/Artistas/Victor e Rosa.jpg' },
      { nome: 'Dan e Barros', src: '/assets/lineup/Artistas/Dan e Barros.jpg' },
      { nome: 'Bruna Peçanha', src: '/assets/lineup/Artistas/Bruna Peçanha.jpg' },
      { nome: 'Imaculada Gadelha', src: '/assets/lineup/Artistas/Imaculada Gadelha.jpg' },
    ],
  },
  {
    titulo: 'DJs',
    pessoas: [
      { nome: 'DJ Santtus', src: '/assets/lineup/Djs/Dj Santtus.jpg' },
      { nome: 'DJ Zen Eyes', src: '/assets/lineup/Djs/Dj Zen Eyes.jpg' },
      { nome: 'DJ Gabs', src: '/assets/lineup/Djs/Dj Gabs.jpg' },
      { nome: 'DJ Auler', src: '/assets/lineup/Djs/Dj Auler.jpg' },
      { nome: 'DJ Pedro Lucas', src: '/assets/lineup/Djs/Dj Pedro Lucas.jpg' },
      { nome: 'DJ WB', src: '/assets/lineup/Djs/Dj WB.jpg' },
    ],
  },
  {
    titulo: 'Foto e vídeo',
    pessoas: [
      { nome: 'Olinda Harue', funcao: 'Videomaker', src: '/assets/lineup/Foto e Video/Olinda Harue.jpg' },
      { nome: 'Flaviana Lima', funcao: 'Fotografia', src: '/assets/lineup/Foto e Video/Flaviana Lima.jpg' },
      { nome: 'Katatal', funcao: 'Videomaker', src: '/assets/lineup/Foto e Video/Katatal.jpg' },
    ],
  },
]

function Grupo({ titulo, pessoas }) {
  const rail = useMarquee()

  return (
    <div className="mt-14">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="font-display text-[26px] tracking-[0.08em] uppercase text-sand">
          {titulo}
        </h3>
        <span className="text-sm font-semibold text-sun-yellow">
          {pessoas.length} confirmados
        </span>
        <div className="flex-1 h-px bg-[#24484F]" />
      </div>

      <div
        ref={rail.ref}
        onMouseEnter={rail.onMouseEnter}
        onMouseLeave={rail.onMouseLeave}
        className="rail flex gap-[18px] overflow-x-auto pb-1.5"
      >
        {/* Duplicado pelo mesmo motivo do carrossel de destaques. */}
        {[...pessoas, ...pessoas].map((pessoa, i) => (
          <figure key={i} aria-hidden={i >= pessoas.length} className="m-0 flex-[0_0_200px]">
            <div className="aspect-[9/16] rounded-[14px] overflow-hidden border border-line hover:border-coral transition-colors bg-[#0F2E35]">
              <img
                src={pessoa.src}
                alt={pessoa.nome}
                loading="lazy"
                className="block w-full h-full object-cover"
              />
            </div>
            <figcaption className="mt-2.5 text-[15px] font-bold text-sand">
              {pessoa.nome}
            </figcaption>
            {pessoa.funcao && (
              <p className="text-[13px] text-haze">{pessoa.funcao}</p>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}

export default function Lineup() {
  return (
    <section id="lineup" className="py-24 border-t border-rule">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center">
          <h2 className="font-display uppercase text-sand text-[clamp(34px,5vw,56px)]">
            Lineup
          </h2>
          <p className="mt-2.5 font-script text-2xl text-sun-yellow">
            quem faz o Zouk Jampa acontecer
          </p>
        </div>

        <figure className="mt-9 mx-auto max-w-[520px] rounded-[20px] overflow-hidden border border-line bg-[#0F2E35]">
          <img
            src="/assets/poster-artistas.jpeg"
            alt="Cartaz com o lineup completo do Zouk Jampa 2026"
            loading="lazy"
            className="block w-full h-auto"
          />
        </figure>

        {grupos.map((grupo) => (
          <Grupo key={grupo.titulo} {...grupo} />
        ))}
      </div>
    </section>
  )
}
