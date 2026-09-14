import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import {
  modelos,
  precos,
  TECIDO,
  PIX_KEY,
  WHATSAPP,
  WHATSAPP_DISPLAY,
  TALLY_ID,
} from './data/camisas'

function Galeria({ modelo }) {
  const [ativa, setAtiva] = useState(0)
  const imagem = modelo.imagens[ativa]

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden bg-night border border-sand/10 aspect-[4/5]">
        <img
          src={imagem.src}
          alt={imagem.alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute bottom-3 left-3 bg-night/85 text-sand text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          {imagem.legenda}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mt-3">
        {modelo.imagens.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setAtiva(i)}
            aria-label={img.alt}
            aria-current={i === ativa}
            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
              i === ativa ? 'border-sun-yellow' : 'border-sand/15 hover:border-sand/40'
            }`}
          >
            <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}

function BlocoPix() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard indisponível — o usuário ainda vê a chave na tela
    }
  }

  return (
    <div className="bg-night-light/60 border border-sand/10 rounded-3xl p-8">
      <p className="text-sand/60 text-sm uppercase tracking-widest mb-3">
        Pix — chave (email)
      </p>
      <p className="font-display text-xl text-sun-yellow mb-6 break-all">{PIX_KEY}</p>
      <button
        onClick={handleCopy}
        className="w-full bg-sunset-gradient text-night font-bold py-3 rounded-full hover:scale-105 transition-transform"
      >
        {copied ? 'Chave copiada! ✓' : 'Copiar chave Pix'}
      </button>
    </div>
  )
}

// Vale para Pix e para cartão: sem o comprovante o pedido não é confirmado.
function ConfirmacaoWhatsApp() {
  const mensagem = encodeURIComponent(
    'Olá! Fiz o pedido de camisa do Zouk Jampa e estou enviando o comprovante de pagamento.'
  )

  return (
    <div className="bg-sunset-gradient text-night rounded-3xl p-8 text-center">
      <p className="font-display text-2xl md:text-3xl mb-2">
        PAGOU? ENVIE O COMPROVANTE
      </p>
      <p className="font-body text-night/80 mb-6 max-w-xl mx-auto">
        Depois de pagar — por Pix ou cartão — mande o comprovante no WhatsApp
        para confirmarmos seu pedido e reservarmos seu tamanho.
      </p>
      <a
        href={`https://wa.me/${WHATSAPP}?text=${mensagem}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-night text-sun-yellow font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform"
      >
        💬 Enviar comprovante — {WHATSAPP_DISPLAY}
      </a>
    </div>
  )
}

function BlocoCartao() {
  return (
    <div className="bg-night-light/60 border border-sand/10 rounded-3xl p-8">
      <p className="text-sand/60 text-sm uppercase tracking-widest mb-5">
        Cartão — escolha a modelagem
      </p>

      <div className="space-y-3">
        {precos.map((p) =>
          p.link ? (
            <a
              key={p.tipo}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-night border border-sand/20 rounded-2xl px-5 py-4 hover:border-sun-yellow/60 transition-colors"
            >
              <span className="font-body text-sand">{p.tipo}</span>
              <span className="font-display text-xl text-sun-yellow">{p.valor}</span>
            </a>
          ) : (
            <div
              key={p.tipo}
              className="flex items-center justify-between bg-night border border-sand/10 rounded-2xl px-5 py-4 opacity-60"
            >
              <span className="font-body text-sand">{p.tipo}</span>
              <span className="font-display text-xl text-sand">{p.valor}</span>
            </div>
          )
        )}
      </div>

      <p className="text-sand/50 text-xs mt-6 leading-relaxed">
        Cada botão paga uma peça. Para mais de uma camisa, repita o pagamento.
        Depois de pagar, envie o comprovante no WhatsApp abaixo.
      </p>
    </div>
  )
}

// O script do Tally carrega de forma assíncrona e pode rodar antes do React
// montar o iframe. Chamamos loadEmbeds() no mount para garantir a altura dinâmica.
// O Tally serve o formulário de outro domínio, então o CSS do site não alcança
// o conteúdo do iframe. Invertendo o brilho do que ele desenha, o texto escuro
// do tema claro vira claro; com transparentBackground=1 o fundo segue
// transparente e o fundo escuro do site aparece atrás.
// Solução definitiva: aplicar o tema escuro no próprio formulário, dentro do
// Tally — aí basta apagar este filtro.
const FILTRO_TEMA_ESCURO = { filter: 'invert(1) hue-rotate(180deg)' }

function FormularioTally() {
  const [enviado, setEnviado] = useState(false)
  // Trocar a key remonta o iframe, devolvendo o formulário em branco.
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const carregar = () => window.Tally?.loadEmbeds()

    if (window.Tally) {
      carregar()
    } else {
      const script = document.querySelector('script[src*="tally.so/widgets/embed.js"]')
      script?.addEventListener('load', carregar)
    }
  }, [tentativa])

  // O iframe do Tally avisa a página a cada envio (ver embed.js: postMessage
  // com um JSON cujo `event` é 'Tally.FormSubmitted').
  useEffect(() => {
    const aoReceberMensagem = (evento) => {
      if (typeof evento.data !== 'string') return
      try {
        const { event } = JSON.parse(evento.data)
        if (event === 'Tally.FormSubmitted') setEnviado(true)
      } catch {
        // Mensagem de terceiros que não é JSON — ignorar
      }
    }

    window.addEventListener('message', aoReceberMensagem)
    return () => window.removeEventListener('message', aoReceberMensagem)
  }, [])

  const novoPedido = () => {
    setEnviado(false)
    setTentativa((n) => n + 1)
  }

  const src = `https://tally.so/embed/${TALLY_ID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`

  return (
    <>
      <iframe
        key={tentativa}
        data-tally-src={src}
        src={src}
        loading="lazy"
        width="100%"
        height="900"
        frameBorder="0"
        title="Pedido de camisas Zouk Jampa 2026"
        className="block w-full"
        style={FILTRO_TEMA_ESCURO}
      />

      {enviado && (
        <div className="border-t border-sand/10 px-6 py-6 text-center">
          <p className="font-body text-sand/70 mb-4">
            Quer pedir mais uma camisa? Preencha o formulário de novo — cada peça
            é um pedido.
          </p>
          <button
            type="button"
            onClick={novoPedido}
            className="inline-block bg-sunset-gradient text-night font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
          >
            + Pedir outra camisa
          </button>
        </div>
      )}
    </>
  )
}

export default function CamisasPage() {
  return (
    <div className="min-h-screen bg-night flex flex-col">
      <header className="border-b border-sand/10 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <a
            href="/"
            className="font-body text-sm text-sand/70 hover:text-sand transition-colors"
          >
            ← Voltar ao site
          </a>
          <img src="/assets/logo-joya.png" alt="Zouk Jampa" className="w-10 opacity-80" />
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 pt-16 pb-12 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-sand mb-4">
            CAMISAS ZOUK JAMPA
          </h1>
          <p className="font-body text-sand/70 max-w-2xl mx-auto">
            Tecido {TECIDO.toLowerCase()}, estampa exclusiva de João Pessoa.
            Todos os modelos saem nas modelagens oversized e cropped.
          </p>
          <p className="font-body text-sand/70 mt-4">
            {precos.map((p) => `${p.tipo} ${p.valor}`).join(' · ')}
          </p>
        </section>

        <div className="max-w-5xl mx-auto px-6 space-y-16">
          {modelos.map((modelo) => (
            <div
              key={modelo.id}
              id={modelo.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center scroll-mt-8"
            >
              <Galeria modelo={modelo} />

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-sun-yellow">
                  {modelo.cor} · {TECIDO}
                </span>
                <h2 className="font-display text-2xl md:text-3xl text-sand mt-2 mb-3">
                  {modelo.nome}
                </h2>
                <p className="font-body text-sand/70 mb-8">{modelo.descricao}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {precos.map((p) => (
                    <div
                      key={p.tipo}
                      className="bg-night-light border border-sand/10 rounded-2xl px-5 py-4"
                    >
                      <p className="font-body text-sm text-sand/60">{p.tipo}</p>
                      <p className="font-display text-2xl text-sand">{p.valor}</p>
                    </div>
                  ))}
                </div>

                <a
                  href="#pedido"
                  className="inline-block bg-sunset-gradient text-night font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  Fazer meu pedido
                </a>
              </div>
            </div>
          ))}
        </div>

        <section id="pedido" className="px-6 py-20 md:py-28 scroll-mt-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="font-display text-3xl md:text-5xl text-sand mb-4">
              FAZER MEU PEDIDO
            </h2>
            <p className="font-body text-sand/70">
              1. Preencha o formulário com modelo, modelagem e tamanho.
              2. Pague por Pix ou cartão. 3. Envie o comprovante no WhatsApp.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-night-light border border-sand/10 rounded-3xl overflow-hidden shadow-2xl">
            <FormularioTally />
          </div>

          <div className="max-w-4xl mx-auto mt-14">
            <h3 className="font-display text-2xl text-sand text-center mb-8">
              PAGAMENTO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BlocoPix />
              <BlocoCartao />
            </div>

            <div className="mt-6">
              <ConfirmacaoWhatsApp />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
