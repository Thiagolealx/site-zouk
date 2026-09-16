import { useMarquee } from '../hooks/useMarquee'

const cards = [
  {
    kicker: 'Pista',
    titulo: '3 bailes incríveis',
    texto: 'Três noites de pista aberta com os DJs residentes e convidados.',
    src: '/assets/destaques/baile.jpg',
  },
  {
    kicker: 'Aulas',
    titulo: 'Mais de 15 horas de aulas',
    texto: 'Trilhas para todos os níveis, do primeiro passo ao avançado.',
    src: '/assets/lineup/Artistas/Lucas e Thayná.jpg',
    pos: 'center 26%',
  },
  {
    kicker: 'Competição',
    titulo: 'Jack & Jill',
    texto: 'Sorteio de pares, júri convidado e premiação no baile de sábado.',
    src: '/assets/destaques/jack-jill.jpg',
  },
  {
    kicker: 'Palco',
    titulo: 'Apresentações especiais',
    texto: 'Shows dos professores e grupos convidados entre os blocos do baile.',
    src: '/assets/lineup/Artistas/Bruna Peçanha.jpg',
    pos: 'center 26%',
  },
  {
    kicker: 'Mar',
    titulo: 'Passeio de catamarã',
    texto: 'Um domingo pelas praias naturais de João Pessoa, com pista a bordo.',
    src: '/assets/alto-mar/foto-01.jpg',
  },
  {
    kicker: 'Lineup',
    titulo: '14 artistas convidados',
    texto: 'Professores do Brasil e de fora dividindo as salas do festival.',
    src: '/assets/poster-artistas.jpeg',
    pos: 'center 20%',
  },
  {
    kicker: 'Som',
    titulo: '6 DJs',
    texto: 'Zouk em todas as vertentes, do clássico ao urban, até o sol nascer.',
    src: '/assets/lineup/Djs/Dj Santtus.jpg',
    pos: 'center 26%',
  },
]

export default function Highlights() {
  const rail = useMarquee()

  return (
    <section id="o-que-te-espera" className="py-24 border-t border-rule">
      <div className="max-w-[1180px] mx-auto px-6">
        <h2 className="font-display uppercase text-sand text-[clamp(34px,5vw,56px)]">
          O que te espera
        </h2>
        <p className="mt-2.5 font-script text-2xl text-sun-yellow">
          quatro dias de sol, mar e zouk
        </p>

        <div
          ref={rail.ref}
          onMouseEnter={rail.onMouseEnter}
          onMouseLeave={rail.onMouseLeave}
          className="rail mt-9 flex gap-5 overflow-x-auto pb-2"
        >
          {/* Lista duplicada: é o que faz o laço do carrossel não ter emenda. */}
          {[...cards, ...cards].map((card, i) => (
            <article
              key={i}
              aria-hidden={i >= cards.length}
              className="flex-[0_0_300px] rounded-[20px] overflow-hidden bg-night-light border border-line hover:border-coral transition-colors flex flex-col"
            >
              <div className="h-[200px] overflow-hidden bg-[#0F2E35]">
                <img
                  src={card.src}
                  alt={card.titulo}
                  loading="lazy"
                  className="block w-full h-full object-cover"
                  style={{ objectPosition: card.pos || 'center' }}
                />
              </div>
              <div className="p-5 grid gap-2 content-start">
                <span className="text-xs font-bold tracking-[0.14em] uppercase text-sun-yellow">
                  {card.kicker}
                </span>
                <h3 className="font-display text-2xl uppercase text-sand">{card.titulo}</h3>
                <p className="text-[15px] leading-[1.5] text-mist">{card.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
