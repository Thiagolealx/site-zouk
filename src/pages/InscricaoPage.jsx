import { useState, useEffect } from 'react'
import { useTallyEmbed } from '../hooks/useTallyEmbed'

// Nome do parâmetro na URL desta página — o que a pessoa vê e compartilha.
const PARAM_URL = 'passe'

// Chave de preenchimento configurada no Tally para o campo
// "Vc deseja adquir o fullpass com passeio de barco".
//
// Precisa ser DIFERENTE de PARAM_URL: o Tally repassa a query da página mãe
// para dentro do formulário, então usar o mesmo nome faria o valor curto
// ("sim") sobrescrever o valor real da opção ("Sim") no fim da URL.
const CHAVE_TALLY = 'passeio'

const TALLY_BASE =
  'https://tally.so/embed/yPopv8?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1'

const passes = [
  {
    id: 'nao',
    // Precisa bater com o texto da opção no Tally, senão o campo vem vazio.
    valorNoTally: 'Não',
    tag: '2º lote',
    titulo: 'Full Pass',
    subtitulo: 'Sem passeio de barco',
    preco: 'R$ 490,00',
    itens: ['3 bailes', 'Mais de 15h de aulas', 'Competição Jack & Jill', 'Apresentações especiais'],
  },
  {
    id: 'sim',
    valorNoTally: 'Sim',
    tag: 'Com catamarã',
    titulo: 'Full Pass Premium',
    subtitulo: 'Com passeio de catamarã',
    preco: 'R$ 590,00',
    itens: ['Tudo do Full Pass', 'Passeio de catamarã no domingo', 'DJs a bordo', 'Paradas para banho'],
  },
]

export default function InscricaoPage() {
  // Chega preenchido quando a pessoa vem de um CTA que já escolheu o passe
  // (o botão do catamarã na home, por exemplo).
  const [passe, setPasse] = useState(() =>
    new URLSearchParams(window.location.search).get(PARAM_URL))

  const escolhido = passes.find((p) => p.id === passe)

  // Trocar o passe remonta o iframe, então o formulário volta em branco.
  // Só acontece antes de preencher, que é quando a escolha é feita.
  const iframeRef = useTallyEmbed(passe)

  useEffect(() => {
    const url = new URL(window.location.href)
    if (passe) url.searchParams.set(PARAM_URL, passe)
    else url.searchParams.delete(PARAM_URL)
    window.history.replaceState({}, '', url.pathname + url.search)
  }, [passe])

  const escolher = (id) => {
    setPasse(id)
    document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const src = escolhido
    ? `${TALLY_BASE}&${CHAVE_TALLY}=${encodeURIComponent(escolhido.valorNoTally)}`
    : TALLY_BASE

  return (
    <section className="pt-[140px] pb-24">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="text-center max-w-[720px] mx-auto">
          <span className="text-xs font-bold tracking-[0.16em] uppercase text-sun-yellow">
            Ingressos
          </span>
          <h1 className="mt-3 font-display uppercase text-sand text-[clamp(38px,6vw,68px)]">
            Garanta sua vaga
          </h1>
          <p className="mt-3.5 text-lg leading-[1.55] text-mist">
            Escolha o passe, preencha a inscrição e pague — tudo na mesma página.
            A vaga só fica reservada com a inscrição enviada.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[22px] items-stretch">
          {passes.map((pass) => {
            const ativo = pass.id === passe
            return (
              <article
                key={pass.id}
                className={`group p-7 rounded-[22px] border flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-coral hover:bg-[linear-gradient(120deg,#FBBF3C,#FB6A55)] ${
                  ativo ? 'border-sun-yellow bg-night-hover' : 'border-line bg-night-light'
                }`}
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
                <div className="mt-auto pt-[22px]">
                  <button
                    type="button"
                    onClick={() => escolher(pass.id)}
                    className={`w-full py-3.5 rounded-full text-base font-bold transition-colors group-hover:bg-none group-hover:bg-night group-hover:text-sun-yellow ${
                      ativo ? 'bg-none bg-night text-sun-yellow border border-sun-yellow' : 'text-night bg-sunset-gradient'
                    }`}
                  >
                    {ativo ? 'Passe escolhido ✓' : 'Quero este passe'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <p className="mt-6 text-center text-[13.5px] leading-relaxed text-haze">
          Reembolso em até 7 dias após a compra · transferência para outra pessoa
          até 45 dias antes do evento (podem ocorrer taxas conforme o lote).
        </p>
      </div>

      <div id="formulario" className="max-w-[820px] mx-auto px-6 mt-20 scroll-mt-24">
        <div className="text-center border-t border-rule pt-16">
          <span className="text-xs font-bold tracking-[0.16em] uppercase text-sun-yellow">
            Passo 2
          </span>
          <h2 className="mt-3 font-display uppercase text-sand text-[clamp(30px,4.5vw,50px)]">
            Faça sua inscrição
          </h2>
          <p className="mt-3.5 text-[17px] leading-[1.55] text-mist">
            {escolhido
              ? `Você escolheu o ${escolhido.titulo}. Preencha os dados abaixo — o Pix e o cartão estão no fim do formulário.`
              : 'Preencha os dados abaixo. O Pix e o cartão estão no fim do formulário, junto com a escolha do passe.'}
          </p>
        </div>

        <div className="mt-10 rounded-[22px] bg-night-light border border-line overflow-hidden shadow-2xl">
          <iframe
            key={passe || 'sem-passe'}
            ref={iframeRef}
            data-tally-src={src}
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
