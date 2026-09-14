import { modelos, precos, vitrineExtras, TECIDO } from '../data/camisas'

export default function Camisas() {
  return (
    <section id="camisas" className="px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl text-sand mb-4">
          CAMISAS ZOUK JAMPA
        </h2>
        <p className="font-body text-sand/70 max-w-2xl mx-auto">
          Leve o Zouk Jampa com você. Peças em tecido {TECIDO.toLowerCase()} com
          estampa exclusiva de João Pessoa, nas modelagens oversized e cropped.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5">
        {modelos.map((modelo) => (
          <a
            key={modelo.id}
            href={`/camisas#${modelo.id}`}
            className="group rounded-2xl overflow-hidden bg-night-light border border-sand/10 hover:border-sun-yellow/60 transition-colors"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={modelo.capa}
                alt={`Camisa ${modelo.nome}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="px-4 py-3">
              <p className="font-display text-lg text-sand">{modelo.nome}</p>
              <p className="font-body text-sm text-sand/50">{modelo.cor}</p>
            </div>
          </a>
        ))}

        {vitrineExtras.map((extra) => (
          <a
            key={extra.id}
            href="/camisas"
            className="group rounded-2xl overflow-hidden bg-night-light border border-sand/10 hover:border-sun-yellow/60 transition-colors"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={extra.src}
                alt={extra.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="px-4 py-3">
              <p className="font-display text-lg text-sand">{extra.titulo}</p>
              <p className="font-body text-sm text-sand/50">{extra.legenda}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="max-w-5xl mx-auto mt-10 text-center">
        <p className="font-body text-sand/70 mb-6">
          {precos.map((p) => `${p.tipo} ${p.valor}`).join(' · ')}
        </p>
        <a
          href="/camisas"
          className="inline-block bg-sunset-gradient text-night font-bold px-10 py-4 rounded-full shadow-lg shadow-sun-orange/30 hover:scale-105 transition-transform"
        >
          Ver camisas e pedir
        </a>
      </div>
    </section>
  )
}
