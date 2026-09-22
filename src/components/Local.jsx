const ENDERECO = 'Avenida João Cirilo da Silva, 3160 — Altiplano Cabo Branco, João Pessoa — PB, 58046-005'

// Busca pelo endereço em vez de coordenadas: abre no app de mapas do
// celular e continua funcionando se o ponto do clube for remarcado.
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  'APCEF PB, Avenida João Cirilo da Silva, 3160, Altiplano Cabo Branco, João Pessoa - PB, 58046-005',
)}`

const notas = [
  { titulo: 'Tudo no mesmo lugar', texto: 'Bailes, aulas e competição acontecem dentro do clube.' },
  { titulo: 'Altiplano Cabo Branco', texto: 'Bairro a poucos minutos da orla de Cabo Branco e Tambaú.' },
  { titulo: 'Estacionamento no local', texto: 'Área própria para quem for de carro.' },
]

export default function Local() {
  return (
    <section id="local" className="py-24 border-t border-rule">
      <div className="max-w-[1180px] mx-auto px-6">
        <h2 className="font-display uppercase text-sand text-[clamp(34px,5vw,56px)]">
          O local
        </h2>
        <p className="mt-2.5 font-script text-2xl text-sun-yellow">
          onde o festival acontece
        </p>

        <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-6 items-start">
          <div className="rounded-[20px] overflow-hidden border border-line bg-night-light">
            <img
              src="/assets/local/apcef.jpg"
              alt="Entrada da APCEF, no Altiplano Cabo Branco, em João Pessoa"
              loading="lazy"
              className="block w-full aspect-[4/3] object-cover bg-[#0F2E35]"
            />
          </div>

          <div className="grid gap-3.5 content-start">
            <div className="px-5 py-[18px] rounded-2xl bg-night-light border border-line">
              <span className="text-xs font-bold tracking-[0.14em] uppercase text-sun-yellow">
                Sede do evento
              </span>
              <h3 className="mt-2 font-display text-3xl uppercase text-sand">APCEF</h3>
              <address className="mt-2 not-italic text-[15px] leading-[1.55] text-mist">
                {ENDERECO}
              </address>
              <a
                href={MAPS}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-6 py-2.5 rounded-full text-sm font-semibold text-sand border border-line hover:border-coral transition-colors"
              >
                Abrir no mapa
              </a>
            </div>

            {notas.map((nota) => (
              <div key={nota.titulo} className="px-5 py-[18px] rounded-2xl bg-night-light border border-line">
                <p className="text-[17px] font-bold text-sand">{nota.titulo}</p>
                <p className="mt-1.5 text-[14.5px] text-haze">{nota.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
