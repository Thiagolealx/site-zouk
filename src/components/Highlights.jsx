const highlights = [
  { label: '3 bailes incríveis', icon: '🎶' },
  { label: 'Mais de 15 horas de aulas', icon: '💃' },
  { label: 'Competição Jack & Jill', icon: '🏆' },
  { label: 'Apresentações especiais', icon: '✨' },
  { label: 'Passeio de catamarã pelas praias naturais de João Pessoa', icon: '⛵' },
  { label: '14 artistas convidados', icon: '🎤' },
  { label: '6 DJs', icon: '🎧' },
]

export default function Highlights() {
  return (
    <section className="bg-night px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl text-sand mb-4">
          O QUE TE ESPERA
        </h2>
        <p className="font-script text-2xl text-sun-yellow">
          quatro dias de sol, mar e zouk
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 bg-night-light/60 border border-sand/10 rounded-2xl px-6 py-5 hover:border-sun-orange/50 transition-colors"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-body text-sand/90 text-base md:text-lg">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
