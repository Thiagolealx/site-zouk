const PAGAMENTO_LINK = 'https://pay.sumup.com/b2c/QDETPPAI'
const WHATSAPP_CONTATO = '5583998699329'
const WHATSAPP_DISPLAY = '(83) 99869-9329'

export default function Pagamento() {
  return (
    <section className="bg-night px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl text-sand mb-4">
          LINK DE PAGAMENTO
        </h2>
        <p className="font-body text-sand/70">
          Pague com segurança pelo link oficial do evento (SumUp).
        </p>
      </div>

      <div className="max-w-md mx-auto bg-night-light/60 border border-sand/10 rounded-3xl p-8 text-center">
        <p className="text-sand/60 text-sm uppercase tracking-widest mb-3">
          Pagamento online
        </p>
        <p className="font-body text-sand/80 mb-6">
          Você será redirecionado para o ambiente seguro da SumUp para concluir a
          compra.
        </p>
        <a
          href={PAGAMENTO_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-sunset-gradient text-night font-bold py-3 rounded-full hover:scale-105 transition-transform"
        >
          Ir para o pagamento
        </a>

        <div className="mt-8 pt-8 border-t border-sand/10 text-left">
          <p className="text-sand/80 text-sm mb-3">
            Dúvidas ou problemas com o pagamento? Fale com a gente:
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_CONTATO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-night border border-sand/20 rounded-full py-3 font-semibold text-sand hover:border-coral/60 transition-colors"
          >
            💬 {WHATSAPP_DISPLAY}
          </a>
          <p className="text-sand/50 text-xs mt-4 leading-relaxed">
            Reembolso possível em até 7 dias após a compra. Transferência para
            outra pessoa até 45 dias antes do evento (podem ocorrer taxas
            conforme o lote).
          </p>
        </div>
      </div>
    </section>
  )
}
