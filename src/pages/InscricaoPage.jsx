import { useTallyEmbed } from '../hooks/useTallyEmbed'

const TALLY_SRC =
  'https://tally.so/embed/yPopv8?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1'

export default function InscricaoPage() {
  const iframeRef = useTallyEmbed()

  return (
    <section className="pt-[140px] pb-24">
      <div className="max-w-[820px] mx-auto px-6">
        <div className="text-center">
          <span className="text-xs font-bold tracking-[0.16em] uppercase text-sun-yellow">
            Inscrição
          </span>
          <h1 className="mt-3 font-display uppercase text-sand text-[clamp(38px,6vw,68px)]">
            Faça sua inscrição
          </h1>
          <p className="mt-3.5 text-lg leading-[1.55] text-mist">
            Leva menos de dois minutos. Preencha depois de fazer o pagamento — é
            assim que reservamos sua vaga.
          </p>
        </div>

        <div className="mt-10 rounded-[22px] bg-night-light border border-line overflow-hidden shadow-2xl">
          <iframe
            ref={iframeRef}
            data-tally-src={TALLY_SRC}
            loading="lazy"
            width="100%"
            height="900"
            frameBorder="0"
            title="Inscrição Zouk Jampa 2026"
            className="block w-full"
          />
        </div>

        <p className="mt-6 text-center text-[13.5px] text-haze">
          Você recebe a confirmação por e-mail em até 24 horas.
        </p>
      </div>
    </section>
  )
}
