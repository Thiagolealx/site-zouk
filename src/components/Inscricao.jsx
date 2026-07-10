export default function Inscricao() {
  return (
    <section id="inscricao" className="bg-night-light/40 px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="font-display text-3xl md:text-5xl text-sand mb-4">
          FAÇA SUA INSCRIÇÃO
        </h2>
        <p className="font-body text-sand/70">
          Preencha o formulário abaixo. Seus dados são sincronizados
          automaticamente com a organização do evento.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-night-light border border-sand/10 rounded-3xl overflow-hidden shadow-2xl">
        <iframe
          data-tally-src="https://tally.so/embed/yPopv8?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
          loading="lazy"
          width="100%"
          height="900"
          frameBorder="0"
          title="Inscrição Zouk Jampa 2026"
          src="https://tally.so/embed/yPopv8?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        />
      </div>
    </section>
  )
}
