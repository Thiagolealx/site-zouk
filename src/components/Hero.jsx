export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden">
      {/* Poster de fundo */}
      <div className="absolute inset-0">
        <img
          src="/assets/poster-artistas.jpeg"
          alt="Artistas convidados do Zouk Jampa 2026"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/60 via-transparent to-transparent h-1/3" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-16 pt-40 text-center flex flex-col items-center">
        <p className="font-display text-2xl md:text-4xl tracking-wide text-sun-yellow mb-2">
          26 <span className="text-sand">A</span> 29 DE NOVEMBRO
        </p>
        <p className="font-body text-sand/90 text-lg md:text-xl mb-8">
          João Pessoa — PB · <span className="text-coral">@zoukjampa</span>
        </p>
        <a
          href="#inscricao"
          className="inline-block bg-sunset-gradient text-night font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-sun-orange/30 hover:scale-105 transition-transform"
        >
          Garantir minha vaga
        </a>
      </div>
    </section>
  )
}
