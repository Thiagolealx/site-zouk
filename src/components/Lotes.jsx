const lotes = [
  {
    nome: 'Full Pass',
    tag: '2º Lote · Sem passeio de barco',
    preco: 'R$ 490,00',
    link: 'https://pay.sumup.com/b2c/XLBZ1JY7WS',
    destaque: false,
  },
  {
    nome: 'Full Pass Premium',
    tag: 'Com passeio de catamarã',
    preco: 'R$ 590,00',
    link: 'https://pay.sumup.com/b2c/QDETPPAI',
    destaque: true,
  },
]

export default function Lotes() {
  return (
    <section id="lotes" className="bg-night-light/40 px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl text-sand mb-4">
          GARANTA SEU INGRESSO
        </h2>
        <p className="font-body text-sand/70">
          Pagamento por Pix ou cartão. Escolha sua opção abaixo.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {lotes.map((lote) => (
          <div
            key={lote.nome}
            className={`rounded-3xl p-8 flex flex-col ${
              lote.destaque
                ? 'bg-sunset-gradient text-night shadow-xl shadow-sun-orange/20'
                : 'bg-night border border-sand/15 text-sand'
            }`}
          >
            {lote.destaque && (
              <span className="text-xs font-bold uppercase tracking-widest mb-3 bg-night text-sun-yellow inline-block px-3 py-1 rounded-full w-fit">
                Com catamarã
              </span>
            )}
            <h3 className="font-display text-2xl mb-1">{lote.nome}</h3>
            <p className={`text-sm mb-6 ${lote.destaque ? 'text-night/80' : 'text-sand/60'}`}>
              {lote.tag}
            </p>
            <p className="font-display text-4xl mb-8">{lote.preco}</p>
            <a
              href={lote.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-auto text-center font-bold py-3 rounded-full transition-transform hover:scale-105 ${
                lote.destaque
                  ? 'bg-night text-sun-yellow'
                  : 'bg-sunset-gradient text-night'
              }`}
            >
              Pagar com cartão
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
