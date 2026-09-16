import { useMarquee } from '../hooks/useMarquee'
import { Link } from '../router'
import { modelos, vitrineExtras, precos, TECIDO } from '../data/camisas'

// Modelos e fotos extras dividem o mesmo trilho: o card é sempre foto,
// nome e uma linha de apoio. A página /camisas é quem mostra o resto.
const cards = [
  ...modelos.map((modelo) => ({
    id: modelo.id,
    src: modelo.capa,
    titulo: modelo.nome,
    legenda: modelo.cor,
    alt: `Camisa ${modelo.nome} vestida, frente e costas`,
  })),
  ...vitrineExtras.map((extra) => ({
    id: extra.id,
    src: extra.src,
    titulo: extra.titulo,
    legenda: extra.legenda,
    alt: extra.alt,
    pos: extra.pos,
  })),
]

export default function Camisas() {
  const rail = useMarquee()

  return (
    <section id="camisas" className="py-24 border-t border-rule">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center">
          <h2 className="font-display uppercase text-sand text-[clamp(34px,5vw,56px)]">
            Camisas do festival
          </h2>
          <p className="mt-2.5 font-script text-2xl text-sun-yellow">
            leve João Pessoa na estampa
          </p>
          <p className="mt-4 text-[15px] text-mist">
            {precos.map((p) => `${p.tipo} ${p.valor}`).join(' · ')} — tecido {TECIDO},
            nas modelagens oversized e cropped.
          </p>
        </div>

        {/* Mesma regra do lineup: sem cópia a lista não enche o trilho, então
            centraliza em vez de deixar um vão à direita. */}
        <div
          ref={rail.ref}
          onMouseEnter={rail.onMouseEnter}
          onMouseLeave={rail.onMouseLeave}
          className={`rail mt-9 flex gap-[18px] overflow-x-auto pb-1.5 ${
            rail.duplicar ? '' : 'justify-center'
          }`}
        >
          {(rail.duplicar ? [...cards, ...cards] : cards).map((card, i) => (
            <figure
              key={`${card.id}-${i}`}
              aria-hidden={i >= cards.length}
              className="m-0 flex-[0_0_240px]"
            >
              <div className="aspect-[4/5] rounded-[14px] overflow-hidden border border-line hover:border-coral transition-colors bg-[#0F2E35]">
                <img
                  src={card.src}
                  alt={card.alt}
                  loading="lazy"
                  className="block w-full h-full object-cover"
                  style={{ objectPosition: card.pos || 'center' }}
                />
              </div>
              <figcaption className="mt-2.5 text-[15px] font-bold text-sand">
                {card.titulo}
              </figcaption>
              <p className="text-[13px] text-haze">{card.legenda}</p>
            </figure>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/camisas"
            className="inline-block px-7 py-3.5 rounded-full text-[15px] font-bold text-night bg-sunset-gradient hover:brightness-110 transition-[filter]"
          >
            Ver as camisas
          </Link>
        </div>
      </div>
    </section>
  )
}
