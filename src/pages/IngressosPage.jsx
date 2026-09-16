import { useState } from 'react'
import { Link } from '../router'

const PIX_KEY = 'zouk.jampa.pb@gmail.com'
const WHATSAPP = '5583998699329'
const WHATSAPP_DISPLAY = '(83) 99869-9329'

const passes = [
  {
    tag: '2º lote',
    titulo: 'Full Pass',
    subtitulo: 'Sem passeio de barco',
    preco: 'R$ 490,00',
    itens: ['3 bailes', 'Mais de 15h de aulas', 'Competição Jack & Jill', 'Apresentações especiais'],
    link: 'https://pay.sumup.com/b2c/XLBZ1JY7WS',
  },
  {
    tag: 'Com catamarã',
    titulo: 'Full Pass Premium',
    subtitulo: 'Com passeio de catamarã',
    preco: 'R$ 590,00',
    itens: ['Tudo do Full Pass', 'Passeio de catamarã no domingo', 'DJs a bordo', 'Paradas para banho'],
    link: 'https://pay.sumup.com/b2c/QDETPPAI',
  },
]

export default function IngressosPage() {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // Clipboard indisponível — o usuário ainda vê a chave na tela
    }
  }

  return (
    <section className="pt-[140px] pb-24">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center max-w-[700px] mx-auto">
          <span className="text-xs font-bold tracking-[0.16em] uppercase text-sun-yellow">
            Ingressos
          </span>
          <h1 className="mt-3 font-display uppercase text-sand text-[clamp(38px,6vw,68px)]">
            Garanta seu ingresso
          </h1>
          <p className="mt-3.5 text-lg leading-[1.55] text-mist">
            Pagamento por Pix ou cartão. Escolha sua opção abaixo.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[22px] items-stretch">
          {passes.map((pass) => (
            <article
              key={pass.titulo}
              className="group p-7 rounded-[22px] bg-night-light border border-line flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-coral hover:bg-[linear-gradient(120deg,#FBBF3C,#FB6A55)]"
            >
              <span className="self-start px-3 py-1.5 rounded-full text-[11.5px] font-bold tracking-[0.12em] uppercase text-sun-yellow bg-night">
                {pass.tag}
              </span>
              <h2 className="font-display text-3xl uppercase text-sand group-hover:text-night transition-colors">
                {pass.titulo}
              </h2>
              <p className="text-[15px] text-mist group-hover:text-night/75 transition-colors">
                {pass.subtitulo}
              </p>
              <p className="mt-2 font-display text-[42px] leading-none text-sand group-hover:text-night transition-colors">
                {pass.preco}
              </p>
              <ul className="mt-2.5 pl-[18px] grid gap-1.5 list-disc text-[15px] leading-[1.45] text-mist group-hover:text-night/75 transition-colors">
                {pass.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                href={pass.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-[22px] block"
              >
                <span className="block py-3.5 rounded-full text-center text-base font-bold text-night bg-sunset-gradient transition-colors group-hover:bg-none group-hover:bg-night group-hover:text-sun-yellow">
                  Pagar com cartão
                </span>
              </a>
            </article>
          ))}
        </div>

        <div
          id="pix"
          className="mt-[72px] p-8 rounded-[22px] bg-night-light border border-line grid gap-[18px] justify-items-center text-center"
        >
          <h2 className="font-display uppercase text-sand text-[clamp(28px,4vw,40px)]">
            Pagamento via Pix
          </h2>
          <p className="max-w-[560px] text-[17px] leading-[1.55] text-mist">
            Prefere Pix? Copie a chave abaixo e envie o comprovante pelo WhatsApp.
          </p>

          <div className="px-[22px] py-[18px] rounded-[14px] bg-night border border-[#24484F] grid gap-2">
            <span className="text-xs font-bold tracking-[0.14em] uppercase text-haze">
              Chave Pix (e-mail)
            </span>
            <span className="font-display text-[22px] text-sun-yellow break-all">
              {PIX_KEY}
            </span>
          </div>

          <button
            type="button"
            onClick={copiar}
            className="px-[26px] py-3.5 rounded-full text-[15.5px] font-bold text-night bg-sunset-gradient hover:brightness-110 transition-[filter]"
          >
            {copiado ? 'Chave copiada ✓' : 'Copiar chave Pix'}
          </button>

          <p className="text-[15px] text-mist">
            Depois do Pix, envie o comprovante para{' '}
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sand underline underline-offset-4 hover:text-sun-yellow transition-colors"
            >
              {WHATSAPP_DISPLAY}
            </a>{' '}
            e receba a confirmação.
          </p>

          <Link to="/inscricao" className="text-[15.5px] font-bold text-sun-yellow hover:text-coral transition-colors">
            Já paguei — quero preencher a inscrição →
          </Link>

          <p className="max-w-[560px] text-xs leading-relaxed text-haze/80">
            Reembolso possível em até 7 dias após a compra. Transferência para
            outra pessoa até 45 dias antes do evento (podem ocorrer taxas
            conforme o lote).
          </p>
        </div>
      </div>
    </section>
  )
}
